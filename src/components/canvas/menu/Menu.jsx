import React from 'react';

export default class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDrawing: false
        };

        this.toggleDraw = this.toggleDraw.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
    }

    toggleDraw() {
        if (!this.state.isDrawing) {
            // enable drawing
            this.props.enableDrawing();
        }
        else {
            this.props.disableDrawing();
        }

        this.setState({
            isDrawing: !this.state.isDrawing
        });
    }

    clearCanvas() {
        this.setState({
            isDrawing: false
        }, () => {
            this.props.clearCanvas();
        });
    }

    render() {
        let drawActive = '';
        if (this.state.isDrawing) {
            drawActive = ' active';
        }

        return (
            <div className="menu">
                <button
                    className={`draw-button ${drawActive}`}
                    onClick={this.toggleDraw}>
                    <div className="ion-edit" />
                </button>
                <button
                    className="text-button"
                    onClick={this.props.addText}>
                    T
                </button>
                <button
                    className="delete-button"
                    onClick={this.clearCanvas}>
                    <div className="ion-trash-b" />
                </button>
                <button
                    className="color-button black"
                    onClick={this.props.pickedBlack} />
                <button
                    className="color-button red"
                    onClick={this.props.pickedRed} />
                <button
                    className="color-button green"
                    onClick={this.props.pickedGreen} />
                <button
                    className="color-button blue"
                    onClick={this.props.pickedBlue} />
            </div>
        );
    }
}