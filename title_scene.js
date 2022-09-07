
import {
    Sprite,
    imageAssets,
    keyPressed,
    randInt,
    lerp,
    emit,
    on,
    collides,
    angleToTarget,
    Text,
    Pool
} from "./kontra/kontra.mjs";



export class TitleScene {
    constructor(canvas,context) {
        this.canvas = canvas;
        this.context = context;
        this.title_text = "death grows a garden... on a jetpack";
        this.txt = Text({
            text : this.title_text,
            x : 400,
            y : 300,
            font: '32px Arial',
            color: 'white',
            anchor :  {x : 0.5, y: 0.5},
            textAlign : "center"
        });
        this.counter = 0;
    }

    update() {
        this.txt.update();
        this.counter++;

        if (this.counter>120) {
            // SWITCH
            emit("TITLE_FINISHED");
        }
    }

    render() {
        this.txt.render();
    }
}