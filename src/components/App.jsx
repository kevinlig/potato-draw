import React from 'react';

import Canvas from './canvas/canvas';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="app-wrapper">
                <Canvas />
            </div>
        );
    }
}
