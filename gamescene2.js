import { imageAssets, Sprite } from "./kontra/kontra.mjs";


export class GameScene2 {
    constructor(canvas,context) {
        this.canvas = canvas;
        this.context = context;

        this.player = Sprite({
            x : this.canvas.width/6, 
            y : this.canvas.height/2,
            anchor: {x: 0.5, y: 0.5},
            image : imageAssets["death_v1.png"]
        });
    }

    update(dt) {
        this.player.update(dt);
    }

    render() {
        this.player.render();
    }

}