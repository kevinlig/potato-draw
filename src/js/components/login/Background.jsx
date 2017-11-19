import React from 'react';
import * as THREE from 'three';
import 'imports-loader?THREE=three!ThreeExtras/loaders/OBJLoader';
import 'imports-loader?THREE=three!ThreeExtras/loaders/MTLLoader';

export default class Background extends React.Component {
    constructor(props) {
        super(props);

        this.nextFrame = null;

        this.resizeRenderer = this.resizeRenderer.bind(this);
        this.animationLoop = this.animationLoop.bind(this);
    }

    componentDidMount() {
        this.startAnimation();
        window.addEventListener('resize', this.resizeRenderer);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeRenderer);
        if (this.nextFrame) {
            window.cancelAnimationFrame(this.nextFrame);
        }
    }

    startAnimation() {
        // measure the screen size
        const screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // set up the renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });

        this.renderer.setSize(screenSize.width, screenSize.height);
        this.renderer.devicePixelRatio = window.devicePixelRatio;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xefefef);
        this.camera = new THREE.PerspectiveCamera(75, screenSize.width / screenSize.height, 0.1, 10);
        this.camera.position.z = 2;
        this.camera.position.y = 0.75;
        this.camera.position.x = -1.2;

        // light the scene
        const sun = new THREE.HemisphereLight(0xefefef, 0xefefef, 0.7);
        this.scene.add(sun);
        const rightPoint = new THREE.PointLight(0xffffff, 0.75, 75);
        rightPoint.position.set(20, 20, 20);
        this.scene.add(rightPoint);

        const leftPoint = new THREE.PointLight(0xffffff, 0.75, 75);
        leftPoint.position.set(-20, 20, 20);
        this.scene.add(leftPoint);

        // import the 3d model
        this.loadMaterial('assets/fries.mtl')
            .then((material) => {
                material.preload();
                return this.loadModel('assets/fries.obj', material);
            })
            .then((object) => {
                this.fries = object;
                this.scene.add(this.fries);
                this.animationLoop();
            })
            .catch((err) => {
                console.log(err);
            });
        
    }

    loadModel(filename, material) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.OBJLoader();
            loader.setMaterials(material);
            loader.load(filename, (object) => {
                resolve(object);
            }, null, (err) => {
                reject(err);
            });
        });
    }

    loadMaterial(filename) {
        return new Promise((resolve) => {
            const loader = new THREE.MTLLoader();
            loader.load(filename, (material) => {
                resolve(material);
            }, null, (err) => {
                reject(err);
            });
        });
    }

    resizeRenderer() {
        const screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.renderer.setSize(screenSize.width, screenSize.height);

        if (this.camera) {
            this.camera.aspect = screenSize.width / screenSize.height;
            this.camera.updateProjectionMatrix();
        }
    }

    animationLoop() {
        this.nextFrame = window.requestAnimationFrame(this.animationLoop);

        // rotate the mesh
        if (this.fries) {
            this.fries.rotation.y -= 0.003;
        }

        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <canvas
                id="potato-canvas"
                ref={(canvas) => {
                    this.canvas = canvas;
                }}>
            </canvas>
        );
    }
}
