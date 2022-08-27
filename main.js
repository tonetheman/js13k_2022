
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
    onPointer,
    collides,
    emit,
    on
} from "./kontra/kontra.mjs";


let ROCKET_COUNT = 3;

// custom player instance
// might not need this in the final version?
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


// called when window is loaded
function main() {

    // kontra stuff
    let { canvas, context } = init();
    initInput();
    initPointer();
    
    // are we moving up? needed for animation
    let spaceDown = false;

    // create the one player instance
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

    // background boxes
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

    // rockets that can kill
    // the player
    let rockets = [];
    for(let i=0;i<ROCKET_COUNT;i++) {
        rockets.push(Sprite({
            x : canvas.width+32,
            y : randInt(32,canvas.height-32),
            dx : -10,
            height : 16,
            width : 16,
            color : 'yellow'
        }));
    };

    // called from an emi of SIG_EOG
    function handle_game_over() {

    }

    // handle the end of game message
    // player was kilt
    on("SIG_EOG", handle_game_over);

    // the one and only render function
    // kontra calls this in the GameLoop
    function gameRender() {
    
        // render the background stuff
        for(let i=0;i<10;i++) {
            pBg[i].render();
        }

        // render the floor (forwgroun)
        bg1.render();
        bg2.render();

        // render the player
        player.render();

        // render the rockets
        for(let i=0;i<ROCKET_COUNT;i++) {
            rockets[i].render();
        }
    
    }

    // game update function called by kontra
    function gameUpdate(dt) {
        
        // move background floor along
        if (bg1.x<-canvas.width) bg1.x = canvas.width;
        if (bg2.x<-canvas.width) bg2.x = canvas.width;

        // kontra update calls
        bg1.update();
        bg2.update();

        // background sprites for now
        for (let i=0;i<10;i++) {

            if (pBg[i].x+pBg[i].width<0) {
                pBg[i].x += canvas.width+pBg[i].width;
            }

            pBg[i].update();
        }

        // game logic for rocket death
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

       // update the player
       player.update();

       // update rockets
       for(let i=0;i<ROCKET_COUNT;i++) {
            
            // check for collision
            if (collides(player,rockets[i])) {
                console.log("COLLIDE");

                emit("SIG_EOG");
            }

            // update the rocket position
            rockets[i].update();

            // did the rocket go off the screen?
            if (rockets[i].x<0) {
                // reset the rocket
                rockets[i].y = randInt(32,canvas.height-32);
                rockets[i].x = canvas.width+(randInt(1,3)*16);
            }
        }
    }
    
    // kontra game loop
    let loop = GameLoop({
        update : gameUpdate,
        render : gameRender
    });

    // start the mess
    loop.start();
}

window.onload=main;