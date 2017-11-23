import React from 'react';
import { Tooltip } from 'react-tippy';
import ConnectionItem from './ConnectionItem';

export default class Connections extends React.Component {
    render() {
        const connectionList = this.props.peers.map((peer) => (
            <ConnectionItem
                peer={peer}
                key={peer} />
        ));

        let hideList = '';
        let hideNoUsers = 'hide';
        if (this.props.peers.length === 0) {
            hideList = 'hide';
            hideNoUsers = '';
        }

        return (
            <div className="active-connections">
                <div className="content">
                    <div className="section-header">
                        <div className="icon">
                            <Tooltip
                                title="Connected users"
                                position="top"
                                trigger="mouseenter"
                                arrow>
                                <div className="ion-wifi" />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="connection-list">
                        <div className={`no-connections ${hideNoUsers}`}>
                            Not connected to any users
                        </div>
                        <ul className={hideList}>
                            {connectionList}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
