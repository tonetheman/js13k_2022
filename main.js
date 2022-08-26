
import {
    SpriteClass,
    init,
    GameLoop,
    initInput
} from "./kontra/kontra.mjs";


export class Player extends SpriteClass {
    constructor(props) {
        super({
            ...props,
            dy : 10,
            anchor : { x : 0.5, y : 0.5 },
            radius : 16
        });
    }

    draw() {
        let { ctx, radius } = this;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0,0,radius,0,2*Math.PI);
        ctx.fill();
    }
}


function gameRender() {

}
function gameUpdate() {

}

function main() {
    let { canvas, context } = init();
    initInput();

    let loop = GameLoop({
        update : gameUpdate,
        render : gameRender
    });
}

window.onload=main;