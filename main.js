
import {
    SpriteClass,
    init,
    GameLoop,
    initInput,
    Sprite,
    randInt,
    onInput,
    keyPressed,
    Vector,
    initPointer,
    onPointer
} from "./kontra/kontra.mjs";


export class Player extends SpriteClass {
    constructor(props) {
        super({
            ...props,
            dy : 5,
            anchor : { x : 0.5, y : 0.5 },
            radius : 16,
            rocket : false
        });
    }

    draw() {
        let { context, radius } = this;
        if (this.rocket) {
            context.fillStyle = '#ffF';
        } else {
            context.fillStyle = '#f00';
        }
        context.beginPath();
        context.arc(0,0,radius,0,2*Math.PI);
        context.fill();
    }
}

function main() {

    let { canvas, context } = init();
    
    initInput();

    initPointer();
    
    let spaceDown = false;

    let player = new Player({
        x : canvas.width/6, 
        y : canvas.height/2});
        
    // bg floor parts
    let bg1 = Sprite({
        x : 0, y : canvas.height-32,
        color : "#6a8d73",
        width : canvas.width,
        height : 32,
        dx : -1
    });
    let bg2 = Sprite({
        x : canvas.width, 
        y : canvas.height-32,
        color : "#f4fdd9",
        width : canvas.width,
        height : 32,
        dx : -1
    });

    let pBg = [];
    for (let i=0;i<10;i++) {
        if (randInt(1,10)<5) {
            // generate 10 background blocks
            let tmp = Sprite({
                x : randInt(0,canvas.width),
                y : randInt(32, canvas.height-32),
                dx : -0.5 * randInt(1,9),
                height : randInt(0,canvas.height/2),
                width : 32 + randInt(0,32),
                color : "#ffe8c2"     
            });
            pBg[i] = tmp;
        } else {
            // generate 10 background blocks
            let tmp = Sprite({
                x : randInt(0,canvas.width),
                y : randInt(32, canvas.height-32),
                dx : -0.5 * randInt(1,9),
                height : randInt(0,canvas.height/2),
                width : 32 + randInt(0,32),
                color : "#f0a868"     
            });
            pBg[i] = tmp;
        }
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

       if (keyPressed("space")) {
            player.rocket = true;
            //player.velocity = player.velocity.add(Vector(0,-10*dt))
            player.velocity.y += -11*dt;
        } else {
            player.rocket = false;
            // gravity
            //player.velocity = player.velocity.add(Vector(0,9.8*dt))
            player.velocity.y += 9.8*dt;
        }

        // bottom handling
       if (player.y>canvas.height) {
        player.y = canvas.height;
        player.velocity.y = 0;
       }

       // top handling something is wrong here?
       if (player.y<0) {
        player.y = 0;
        player.velocity.y = 0;
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