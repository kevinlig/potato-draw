const firebase = require('firebase/app');
require('firebase/database');

import firebaseConfig from '../../../firebaseConfig';

class NetworkManager {
    constructor() {

    }

    connectToFirebase(username) {
        const app = firebase.initializeApp(firebaseConfig);

        this.database = app.database();

        // set up synchronization
        this.database.ref('/users').on('value', (snapshot) => {
            const value = snapshot.val();
            console.log(value);
        });

        // create a new user
        this.database.ref(`/users/${username}`).set('hello');
        
    }
}

const instance = new NetworkManager();
export default instance;
