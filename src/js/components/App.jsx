import React from 'react';

import NetworkManager from 'network/NetworkManager';

import Login from 'components/login/Login';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeScreen: 'login',
            user: '',
            online: {},
            host: '',
            isHost: false
        };

        this.registerUser = this.registerUser.bind(this);
        this.receiveUserUpdates = this.receiveUserUpdates.bind(this);
    }

    componentDidMount() {
        this.connectToNetwork();
    }

    connectToNetwork() {
        NetworkManager.receivers['app'] = this.receiveUserUpdates;
        NetworkManager.connectToFirebase();

    }

    receiveUserUpdates(users) {
        this.setState({
            online: users
        });
    };

    registerUser(username) {
        NetworkManager.registerUser(username)
            .then(() => {
                this.setState({
                    user: username
                });
            });
    }

    render() {
        if (this.state.activeScreen === 'login') {
            return (<Login
                {...this.state}
                registerUser={this.registerUser} />);
        }
        return 'canvas';
    }
}