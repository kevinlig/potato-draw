import React from 'react';

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
        
    }

    render() {
        return (
            <div className="login-screen">
                <div className="header">
                    <div className="leader">
                        Welcome to
                    </div>
                    <h1>Potato v2</h1>
                    <h2>User Lobby</h2>
                    <hr className="header-line" />
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
        );
    }
}