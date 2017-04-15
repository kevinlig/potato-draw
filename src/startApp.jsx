import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

const startApp = () => {
    ReactDOM.render(
        <App />,
        document.getElementById('app')
    );
}

export default startApp;
