import { fabric } from 'fabric';

// import Menu from './Menu';

class Canvas {
    constructor() {
        this._buildCanvas();
    }

    _buildCanvas() {
        this.element = document.querySelector('#draw-pad');

        if (!this.fabric) {
            // set up the fabric element
            this.fabric = new fabric.Canvas(this.element);
        }
    }
}

export default Canvas;