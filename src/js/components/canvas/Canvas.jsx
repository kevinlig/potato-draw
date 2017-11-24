import React from 'react';
import Mousetrap from 'mousetrap';
import { fabric } from 'fabric';

import Menu from './menu/Menu';
import Connections from './menu/Connections';

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            color: '#424242'
        };


        this.broadcastCanvas = this.broadcastCanvas.bind(this);

        this.enableDrawing = this.enableDrawing.bind(this);
        this.disableDrawing = this.disableDrawing.bind(this);

        this.deleteItems = this.deleteItems.bind(this);

        this.receiveFile = this.receiveFile.bind(this);
        this.prepareToReceiveFile = this.prepareToReceiveFile.bind(this);

        this.clearCanvas = this.clearCanvas.bind(this);

        this.pickedBlack = this.pickedBlack.bind(this);
        this.pickedRed = this.pickedRed.bind(this);
        this.pickedBlue = this.pickedBlue.bind(this);
        this.pickedGreen = this.pickedGreen.bind(this);

        this.addText = this.addText.bind(this);
    }

    componentDidMount() {
        this.prepareCanvas();
    }

    componentWillUnmount() {
        this.wrapper.removeEventListener('dragenter', this.prepareToReceiveFile);
        this.wrapper.removeEventListener('dragover', this.prepareToReceiveFile);
        this.wrapper.removeEventListener('drop', this.receiveFile);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.renderId !== this.props.renderId) {
            this.receiveCanvas(nextProps.canvasState);
        }
    }

    prepareCanvas() {
        this.fabric = new fabric.Canvas(this.canvas);

        // setup keyboard shortcuts
        Mousetrap.bind(['del', 'backspace'], this.deleteItems);

        // also allow the canvas div wrapper to accept files
        this.wrapper.addEventListener('dragenter', this.prepareToReceiveFile);
        this.wrapper.addEventListener('dragover', this.prepareToReceiveFile);
        this.wrapper.addEventListener('drop', this.receiveFile);


        this.fabric.on('object:modified', this.broadcastCanvas);
        this.fabric.on('path:created', this.broadcastCanvas);
        this.fabric.on('text:changed', this.broadcastCanvas);
    }

    prepareToReceiveFile(e) {
        e.preventDefault();
    }

    receiveFile(e) {
        e.preventDefault();

        // read the file
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const data = reader.result;

            // create an image and add it to the canvas
            fabric.Image.fromURL(data, (img) => {
                img.top = e.offsetY;
                img.left = e.offsetX;

                this.fabric.add(img);
                img.bringToFront();
                this.fabric.renderAll();

                this.broadcastCanvas();
            });
            
        };

    }

    enableDrawing() {
        this.fabric.isDrawingMode = true;
        this.fabric.freeDrawingBrush.width = 3;
        this.fabric.freeDrawingBrush.color = this.state.color;
    }

    disableDrawing() {
        this.fabric.isDrawingMode = false;
    }

    pickedBlack() {
        this.fabric.freeDrawingBrush.color = '#424242';
        this.setState({
            color: '#424242'
        });
    }

    pickedRed() {
        this.fabric.freeDrawingBrush.color = '#f44336';
        this.setState({
            color: '#f44336'
        });
    }

    pickedBlue() {
        this.fabric.freeDrawingBrush.color = '#3F51B5';
        this.setState({
            color: '#3F51B5'
        });
    }

    pickedGreen() {
        this.fabric.freeDrawingBrush.color = '#4CAF50';
        this.setState({
            color: '#4CAF50'
        });
    }

    addText() {
        const value = window.prompt("Enter text");

        const text = new fabric.Text(value, {
            fontFamily: 'Source Sans Pro',
            fontSize: 20
        });

        this.fabric.add(text);
        text.bringToFront();

        this.broadcastCanvas();
    }

    deleteItems() {
        const selectedObject = this.fabric.getActiveObject();
        const selectedGroup = this.fabric.getActiveGroup();

        if (selectedObject) {
            this.fabric.remove(selectedObject);
        }

        if (selectedGroup) {
            const objects = selectedGroup.getObjects();
            this.fabric.discardActiveGroup(selectedGroup);
            objects.forEach((obj) => {
                this.fabric.remove(obj);
            });
        }

        this.broadcastCanvas();
    }

    clearCanvas() {
        this.disableDrawing();

        this.fabric.clear();
        this.broadcastCanvas();
    }

    broadcastCanvas() {
        const data = this.fabric.toDatalessJSON();
        this.props.broadcastMessage(data);
    }

    receiveCanvas(data) {
        this.fabric.loadFromDatalessJSON(data, () => {
            this.fabric.renderAll();
        });
    }

    render() {
        return (
            <div
                className="pad-wrapper"
                ref={(div) => {
                    this.wrapper = div;
                }}>
                <Menu
                    enableDrawing={this.enableDrawing}
                    disableDrawing={this.disableDrawing}
                    clearCanvas={this.clearCanvas}
                    pickedBlack={this.pickedBlack}
                    pickedRed={this.pickedRed}
                    pickedBlue={this.pickedBlue}
                    pickedGreen={this.pickedGreen}
                    addText={this.addText} />
                <Connections peers={this.props.peers} />
                <canvas
                    id="draw-pad"
                    className="potato-pad"
                    width={1500}
                    height={1500}
                    ref={(canvas) => {
                        this.canvas = canvas;
                    }} />
            </div>
        );
    }
}