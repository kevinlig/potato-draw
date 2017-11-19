import React from 'react';

import Login from 'components/login/Login';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeScreen: 'login',
            user: '',
            online: [],
            isHost: false
        };
    }

    render() {
        if (this.state.activeScreen === 'login') {
            return <Login {...this.state} />;
        }
        return 'canvas';
    }
}