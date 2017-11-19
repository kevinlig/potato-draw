import React from 'react';
import Background from './Background';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: ''
        };

        this.submitForm = this.submitForm.bind(this);
        this.changedName = this.changedName.bind(this);
    }

    changedName(e) {
        const newValue = e.target.value;

        const disallowedValidation = /[^A-Za-z0-9 ]+/g
        if (disallowedValidation.test(newValue)) {
            // not a valid user name
            return;
        }

        this.setState({
            username: newValue
        });
    }

    submitForm(e) {
        e.preventDefault();
        if (this.state.username === '') {
            // no user name provided
            return;
        }

        this.props.registerUser(this.state.username);   
    }

    roomContents() {
        return 'There are currently no other users.';
    }

    render() {
        return (
            <div className="login-screen">
                <Background />
                <div className="login-content-wrapper">
                    <div className="login-content">
                        <div className="header">
                            <div className="leader">
                                Welcome to
                            </div>
                            <h1>Potato v2</h1>
                            <h2>User Lobby</h2>
                            <hr className="header-line" />
                        </div>
                        <div className="room-info">
                            {this.roomContents()}
                        </div>
                        <form className="login-form">
                            <label htmlFor="username">
                                Enter a display name to continue:
                            </label>
                            <div className="entry-group">
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Display name"
                                    value={this.state.username}
                                    onChange={this.changedName} />
                                <button
                                    className="submit-button"
                                    onClick={this.submitForm}>
                                    Enter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="attribution">
                    <a href="https://poly.google.com/view/4hpYt9IW-1k" target="_blank" rel="noopener noreferrer">Model</a> by Google / <a href="https://creativecommons.org/licenses/by/3.0/legalcode" target="_blank" rel="noopener noreferrer">CC-BY</a>
                </div>
            </div>
        );
    }
}