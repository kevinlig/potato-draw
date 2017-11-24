import SimplePeer from 'simple-peer';
const firebase = require('firebase/app');
require('firebase/database');

import firebaseConfig from '../../../firebaseConfig';
import turnConfig from '../../../turnConfig';

const connectionServers = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: turnConfig.url,
            username: turnConfig.username,
            credential: turnConfig.password
        }
    ]
};

class NetworkManager {
    constructor() {
        this.user = null;
        this.cleanedUp = false;
        this.initializedData = false;
        this.activeUsers = {};

        this.connections = {};

        this.appRef = null;
    }

    connectToFirebase() {
        const app = firebase.initializeApp(firebaseConfig);

        this.database = app.database();

        // set up synchronization
        this.database.ref('/users').on('value', (snapshot) => {
            const value = snapshot.val();
            const users = Object.assign({}, value);
            delete users.__lastCleanup;
            this.activeUsers = this.removeDeadUsers(users);

            // remove old users from the database
            if (!this.cleanedUp) {
                this.cleanupUsers(value);
            }
        });
    }

    removeDeadUsers(users) {
        const now = Date.now();
        const livingUsers = {};
        for (const username in users) {
            const user = users[username];
            if (now - user.alive <= 30000) {
                // user pinged a heartbeat in the last 30 seconds
                livingUsers[username] = user;
            }
            else if (now - user.alive > 30000 && this.connections[username]) {
                // the user is offline but there was a previous connection to them, remove it
                this.connections[username].destroy();
            }
        }

        return livingUsers;
    }

    cleanupUsers(users) {
        this.cleanedUp = true;
        const now = Date.now();
        if (users.__lastCleanup && (now - users.__lastCleanup) < (30 * 60 * 1000)) {
            // a clean up has happened in the last 30 min
            return;
        }

        const newUsers = Object.assign({}, users);
        for (const username in users) {
            const user = users[username];
            if (now - user.alive > 30000) {
                // user hasn't responded in 30 seconds, remove
                delete newUsers[username];
            }
        }

        newUsers.__lastCleanup = now;
        this.database.ref('/users').set(newUsers);
    }

    registerUser(username) {
        this.user = {
            name: username,
            joined: Date.now(),
            alive: Date.now()
        };

        window.setTimeout(() => {
            this.sendHeartbeat();
        }, 10000);

        return new Promise((resolve) => {
            this.database.ref(`/users/${username}`).set(this.user)
                .then(() => {
                    this.listenForInboundConnections();
                    this.connectToActive(this.activeUsers);
                    resolve();
                });
        });
    }

    sendHeartbeat() {
        this.database.ref(`/users/${this.user.name}/alive`).set(Date.now());

        window.setTimeout(() => {
            this.sendHeartbeat();
        }, 10000);
    }

    connectToActive(users) {
        const now = Date.now();

        for (const username in users) {
            if (username === this.user.name) {
                // don't connect to yourself
                continue;
            }
            else if (this.connections[username]) {
                // this connection already exists
                continue;
            }
            else if (now - users[username].alive > 30000) {
                // user hasn't been alive for over 30 seconds, assume they're offline
                if (this.connections[username]) {
                    // delete this user's connection
                    this.connections[username].destroy();
                    delete this.connections[username];
                }
                continue;
            }
            console.log(`initiate with ${username}`);

            this.connectToUser(username);
        }
    }

    connectToUser(username) {
        const peerConnection = this.createPeerConnection(username, true);
        this.connections[username] = peerConnection;
    }

    createPeerConnection(username, initiator = false) {
        const peerConnection = new SimplePeer({
            initiator,
            reconnectTimer: 3000,
            config: connectionServers
        });

        peerConnection.on('signal', (response) => {
            // received signal from user
            this.sendSignalToRecipient(username, response);
        });

        peerConnection.on('connect', () => {
            // connected to user
            if (this.appRef) {
                this.appRef.connectedToPeer(username);
                // remove the signal row from the DB
                this.database.ref(`/users/${this.user.name}/signals/${username}`).remove();
            }
            if (!this.initializedData) {
                // ask for the current data state up to this point
                this.initializedData = true;
                this.requestInitialDataset();
            }
        });
        
        peerConnection.on('data', (raw) => {
            // received data
            const data = JSON.parse(raw);
            if (data.type) {
                // this is a special request
                if (data.type === 'initialRequest') {
                    // the user is requesting an initial data dump
                    this.provideInitialDataset(username);
                }
                else if (data.type === 'initialData') {
                    // the user is responding with the initial data dump
                    this.receiveInitialDataSet(data);
                }
                return;
            }
            if (this.appRef) {
                this.appRef.receivedMessage(username, data);
            }
        });

        peerConnection.on('close', () => {
            // user disconnected
            if (this.connections[username]) {
                // remoe the connection from our connection list
                delete this.connections[username];
                // remove the signal row from the DB
                this.database.ref(`/users/${this.user.name}/signals/${username}`).remove();
            }
            if (this.appRef) {
                this.appRef.disconnectedFromPeer(username);
            }
        });

        return peerConnection;
    }

    completeOutboundConnection(username, data) {
        this.connections[username].signal(data);
    }

    sendSignalToRecipient(recipient, signal) {
        this.database.ref(`/users/${recipient}/signals/${this.user.name}`).set(JSON.stringify(signal));
    }

    listenForInboundConnections() {
        this.database.ref(`/users/${this.user.name}/signals`).on('value', (snapshot) => {
            const signals = snapshot.val();

            for (const username in signals) {
                const signal = JSON.parse(signals[username]);
                if (this.connections[username] && !this.connections[username].connected) {
                    // this is a response to a pending outbound connection, complete it
                    this.completeOutboundConnection(username, signal);
                }
                else if (!this.connections[username]) {
                    // a new user has connected
                    this.acceptInboundConnection(username, signal);
                }
            }
        });
    }

    acceptInboundConnection(username, signal) {
        const inboundConnection = this.createPeerConnection(username, false);
        this.connections[username] = inboundConnection;
        // injest the signal
        inboundConnection.signal(signal);
    }

    requestInitialDataset() {
        const users = Object.keys(this.connections);
        if (users.length === 0) {
            // you are the first user, don't do anything
            return;
        }
        // pick a user
        const user = users[0];
        // ask them for their current data
        this.sendData(user, {
            type: 'initialRequest'
        });
    }

    provideInitialDataset(recipient) {
        if (this.appRef) {
            const data = this.appRef.generateCurrentState();
            this.sendData(recipient, {
                data,
                type: 'initialData'
            });
        }
    }

    receiveInitialDataSet(data) {
        if (this.appRef) {
            this.appRef.populateState(data.data);
        }
    }

    sendData(recipient, data) {
        let connection = this.connections[recipient];
        if (!connection) {
            console.log(`Not connected to ${recipient}`);
            return;
        }

        connection.send(JSON.stringify(data));
    }

    broadcastData(data) {
        for (const username in this.connections) {
            this.sendData(username, data);
        }
    }
}

const instance = new NetworkManager();
export default instance;
