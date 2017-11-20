import SimplePeer from 'simple-peer';
const firebase = require('firebase/app');
require('firebase/database');

import firebaseConfig from '../../../firebaseConfig';

const connectionServers = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

class NetworkManager {
    constructor() {
        this.user = null;
        this.cleanedUp = false;
        this.activeUsers = {};

        this.connections = {};

        this.receivers = {};
    }

    connectToFirebase() {
        const app = firebase.initializeApp(firebaseConfig);

        this.database = app.database();

        // set up synchronization
        this.database.ref('/users').on('value', (snapshot) => {
            const value = snapshot.val();
            const users = Object.assign({}, value);
            delete users.__lastCleanup;

            for (const id in this.receivers) {
                const receiver = this.receivers[id];
                receiver(users);
            }

            this.activeUsers = users;

            // remove old users from the database
            if (!this.cleanedUp) {
                this.cleanupUsers(value);
            }
        });
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
            if (now - user.alive > 60000) {
                // user hasn't responded in 60 seconds, remove
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
            else if (now - users[username].alive > 60000) {
                // user hasn't been alive for over 60 seconds, assume they're offline
                continue;
            }

            this.connectToUser(username);
        }
    }

    connectToUser(username) {
        const peerConnection = new SimplePeer({ 
            initiator: true,
            config: connectionServers
        });
        this.connections[username] = peerConnection;

        peerConnection.on('signal', (data) => {
            // signal is ready, send it to the recipient
            console.log(`signal ready for ${username}`);
            console.log(`this is an offer`);
            this.sendSignalToRecipient(username, data);
            
        });

        peerConnection.on('connect', () => {
            console.log(`${username} is connected!`);
            console.log('sending message HELLO');
            this.sendData(username, 'Hello there!');
        });

        peerConnection.on('data', (data) => {
            console.log(`RECEIVED MESSAGE: ${data}`);
        });
    }

    completeOutboundConnection(username, data) {
        this.connections[username].signal(data);
    }

    sendSignalToRecipient(recipient, signal) {
        console.log(`sending to ${recipient}`);
        this.database.ref(`/users/${recipient}/signals/${this.user.name}`).set(JSON.stringify(signal));
    }

    listenForInboundConnections() {
        this.database.ref(`/users/${this.user.name}/signals`).on('value', (snapshot) => {
            const signals = snapshot.val();

            for (const username in signals) {
                const signal = JSON.parse(signals[username]);
                if (this.connections[username]) {
                    // this is a response to an outbound connection, complete it
                    this.completeOutboundConnection(username, signal);
                }
                else if (!this.connections[username]) {
                    // a new user has connected or an old user has reconnected
                    this.acceptInboundConnection(username, signal);
                }
            }
        });
    }

    acceptInboundConnection(username, signal) {
        console.log(`received request from ${username}`);

        const inboundConnection = new SimplePeer({
            config: connectionServers
        });
        this.connections[username] = inboundConnection;

        inboundConnection.on('signal', (response) => {
            console.log(`sending response signal to ${username}`);
            this.sendSignalToRecipient(username, response);
        });

        inboundConnection.on('connect', () => {
            console.log(`connected to ${username}`);
        });
        
        inboundConnection.on('data', (data) => {
            console.log(`RECEIVED MESSAGE: ${data}`);
        });
        // injest the signal
        inboundConnection.signal(signal);
    }

    sendData(recipient, data) {
        let connection = this.connections[recipient];
        if (!connection) {
            console.log(`not connected to ${recipient}`);
            return;
        }

        connection.send(data);
    }
}

const instance = new NetworkManager();
export default instance;
