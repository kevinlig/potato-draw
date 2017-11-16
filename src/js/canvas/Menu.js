class Menu {
    constructor(options) {
        this.wrapper = options.element;
        this.canvas = options.canvas;


        this.disableDrawing = this.disableDrawing.bind(this);
        this.enableDrawing = this.enableDrawing.bind(this);

        this._buildMenu();
    }

    _buildMenu() {
        this._drawButton = document.querySelector('.draw-button');
        const textButton = document.querySelector('.text-button');
        const deleteButton = document.querySelector('.delete-button');
        const blackButton = document.querySelector('.color-button.black');
        const redButton = document.querySelector('.color-button.red');
        const greenButton = document.querySelector('.color-button.green');
        const blueButton = document.querySelector('.color-button.blue');

        this._drawButton.addEventListener('click', this.canvas.toggleDrawing);
        textButton.addEventListener('click', this.canvas.addText);
        deleteButton.addEventListener('click', this.canvas.clearCanvas);

        blackButton.addEventListener('click', this.canvas.pickedBlack);
        redButton.addEventListener('click', this.canvas.pickedRed);
        greenButton.addEventListener('click', this.canvas.pickedGreen);
        blueButton.addEventListener('click', this.canvas.pickedBlue);
    }

    disableDrawing() {
        this._drawButton.classList.remove('active');
    }

    enableDrawing() {
        this._drawButton.classList.add('active');
    }
}

export default Menu;
