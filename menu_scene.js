
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



export class MenuScene {
    constructor(canvas,context) {
        this.canvas = canvas;
        this.context = context;
        
        this.title_text = 
        "stop the bad guys from throwing souls\ninto the portal...\nif your bar fills up...\nyou are done for...";
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
            emit("MENU_FINISHED");
        }
        
    }

    render() {
        this.txt.render();
    }
}