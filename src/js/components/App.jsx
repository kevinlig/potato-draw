import React from 'react';

import NetworkManager from 'network/NetworkManager';

import Login from 'components/login/Login';
import Canvas from 'components/canvas/Canvas';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeScreen: 'login',
            user: '',
            host: '',
            peers: [],
            isHost: false,
            renderId: 0,
            canvasState: {}
        };

        this.registerUser = this.registerUser.bind(this);
        this.connectedToPeer = this.connectedToPeer.bind(this);
        this.disconnectedFromPeer = this.disconnectedFromPeer.bind(this);
        this.broadcastMessage = this.broadcastMessage.bind(this);
    }

    componentDidMount() {
        this.connectToNetwork();
    }

    connectToNetwork() {
        NetworkManager.appRef = this;
        NetworkManager.connectToFirebase();

    }

    registerUser(username) {
        NetworkManager.registerUser(username)
            .then(() => {
                this.setState({
                    user: username,
                    activeScreen: 'canvas'
                });
            });
    }

    connectedToPeer(peer) {
        this.setState({
            peers: [...this.state.peers, peer]
        });
    }

    disconnectedFromPeer(peer) {
        const clonedPeers = Array.from(this.state.peers);
        const index = this.state.peers.indexOf(peer);
        clonedPeers.splice(index, 1);
        this.setState({
            peers: clonedPeers
        });
    }


    receivedMessage(sender, data) {
        if (data.id <= this.state.renderId) {
            // this is an outdated canvas iteration, discard it
            return;
        }

        this.setState({
            renderId: data.id,
            canvasState: data.data
        });
    }

    broadcastMessage(message) {
        const renderId = this.state.renderId + 1;
        const data = {
            data: message,
            id: renderId
        };

        NetworkManager.broadcastData(data);

        this.setState({
            renderId,
            canvasState: message
        });
    }

    render() {
        if (this.state.activeScreen === 'login') {
            return (<Login
                {...this.state}
                registerUser={this.registerUser} />);
        }
        return (
            <Canvas
                {...this.state}
                broadcastMessage={this.broadcastMessage} />
        );
    }
}