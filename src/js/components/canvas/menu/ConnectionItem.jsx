import React from 'react';
import { Tooltip } from 'react-tippy';

const ConnectionItem = (props) => (
    <li>
        <div className="icon">
            <Tooltip
                title={props.peer}
                position="top"
                trigger="mouseenter"
                arrow>
                <div className="ion-person" />
            </Tooltip>
        </div>
    </li>
);

export default ConnectionItem;