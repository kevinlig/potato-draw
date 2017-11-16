import { fabric } from 'fabric';
import Mousetrap from 'mousetrap';

import Menu from './Menu';

class Canvas {
    constructor() {
        this.toggleDrawing = this.toggleDrawing.bind(this);
        this.enableDrawing = this.enableDrawing.bind(this);
        this.disableDrawing = this.disableDrawing.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.pickedBlack = this.pickedBlack.bind(this);
        this.pickedRed = this.pickedRed.bind(this);
        this.pickedBlue = this.pickedBlue.bind(this);
        this.pickedGreen = this.pickedGreen.bind(this);
        this.addText = this.addText.bind(this);

        this.state = {
            isDrawing: false,
            color: '#424242',
        };

        this._buildCanvas();
        this._buildMenu();
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
    }

    toggleDrawing() {
        if (this.state.isDrawing) {
            this.disableDrawing();
        }
        else {
            this.enableDrawing();
        }

        this.setState({
            isDrawing: !this.state.isDrawing
        });
    }

    enableDrawing() {
        this.fabric.isDrawingMode = true;
        this.fabric.freeDrawingBrush.width = 3;
        this.fabric.freeDrawingBrush.color = this.state.color;
        if (this.menu) {
            this.menu.enableDrawing();
        }
    }

    disableDrawing() {
        this.fabric.isDrawingMode = false;
        if (this.menu) {
            this.menu.disableDrawing();
        }
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
    }

    clearCanvas() {
        this.disableDrawing();

        this.fabric.clear();
    }

    _buildCanvas() {
        this.element = document.querySelector('#draw-pad');

        if (!this.fabric) {
            // set up the fabric element
            this.fabric = new fabric.Canvas(this.element);
        }

        // bind keyboard events
        Mousetrap.bind(['del', 'backspace'], this.deleteItems);
    }

    _buildMenu() {
        const menuDiv = document.querySelector('#menu');
        this.menu = new Menu({
            element: menuDiv,
            canvas: this
        });
    }
}

export default Canvas;