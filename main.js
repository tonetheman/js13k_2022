
import {
    SpriteClass,
    init,
    GameLoop,
    initInput,
    Sprite,
    randInt,
    onInput,
    keyPressed
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
    

    let spaceDown = false;

    let player = new Player({x : canvas.width/2, 
        y : canvas.height/2});

    // bg floor parts
    let bg1 = Sprite({
        x : 0, y : canvas.height-32,
        color : "green",
        width : canvas.width,
        height : 32,
        dx : -1
    });
    let bg2 = Sprite({
        x : canvas.width, 
        y : canvas.height-32,
        color : "yellow",
        width : canvas.width,
        height : 32,
        dx : -1
    });

    let pBg = [];
    for (let i=0;i<10;i++) {
        // generate 10 background blocks
        let tmp = Sprite({
            x : randInt(0,canvas.width),
            y : randInt(32, canvas.height-32),
            dx : -0.1 * randInt(1,9),
            height : randInt(0,canvas.height/2),
            width : 32 + randInt(0,32),
            color : "blue"     
        });
        pBg[i] = tmp;
    }


    function gameRender() {
    
        for(let i=0;i<10;i++) {
            pBg[i].render();
        }

        bg1.render();
        bg2.render();

        player.render();
    
    }
    function gameUpdate(dt) {
        
        if (bg1.x<-canvas.width) bg1.x = canvas.width;
        if (bg2.x<-canvas.width) bg2.x = canvas.width;

        bg1.update();
        bg2.update();

        for (let i=0;i<10;i++) {

            if (pBg[i].x+pBg[i].width<0) {
                pBg[i].x += canvas.width+pBg[i].width;
            }

            pBg[i].update();
        }

        /*
        if (player.y - player.radius > canvas.height) {
            player.dy *= -1;
        }
        if (player.y-player.radius < 0) {
            player.dy *= -1;
        }
        */

       if (keyPressed("space")) {
            //player.dy = -1;
            player.ddy -= -1*dt;
       } else {
            // gravity
            player.ddy += 1*dt;
       }

       if (player.ddy>1) {
            player.ddy = 1;
       }
       if (player.dy>1) {
            player.dy = 2;
       }
       if (player.y>canvas.height) {
        player.y = 0;
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