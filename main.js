
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
            dy : 5,
            anchor : { x : 0.5, y : 0.5 },
            radius : 16
        });
    }

    draw() {
        let { context, radius } = this;
        context.fillStyle = '#f00';
        context.beginPath();
        context.arc(0,0,radius,0,2*Math.PI);
        context.fill();
    }
}



function main() {

    let { canvas, context } = init();
    initInput();
    let player = new Player({x : canvas.width/2, 
        y : canvas.height/2});

    function gameRender() {
        player.render();
    }
    function gameUpdate() {
        
        if (player.y - player.radius > canvas.height) {
            player.dy *= -1;
        }
        if (player.y-player.radius < 0) {
            player.dy *= -1;
        }

        player.update();
    }
    

    let loop = GameLoop({
        update : gameUpdate,
        render : gameRender
    });
    loop.start();
}

window.onload=main;