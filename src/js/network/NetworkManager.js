const firebase = require('firebase/app');
require('firebase/database');

import firebaseConfig from '../../../firebaseConfig';

class NetworkManager {
    constructor() {
        this.user = null;
        this.activeUsers = {};
    }

    connectToFirebase() {
        const app = firebase.initializeApp(firebaseConfig);

        this.database = app.database();

        // set up synchronization
        this.database.ref('/users').on('value', (snapshot) => {
            const value = snapshot.val();
            console.log(value);
        });        
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

        return this.database.ref(`/users/${username}`).set(this.user);
    }

    sendHeartbeat() {
        this.user = Object.assign({}, this.user, {
            alive: Date.now()
        });

        this.database.ref(`/users/${this.user.name}`).set(this.user);

        window.setTimeout(() => {
            this.sendHeartbeat();
        }, 10000);
    }
}

const instance = new NetworkManager();
export default instance;
