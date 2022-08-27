
import {
    Sprite,
    randInt,
    on,
    emit,
    keyPressed,
    collides
} from "./kontra/kontra.mjs";
import {
    Player
} from "./player";

let ROCKET_COUNT = 3;

export class GameScene {
    constructor(canvas,context) {
        this._dt = 0.0;
        this.canvas = canvas;
        this.context = context;

        this.spaceDown = false;
        // create the one player instance
        this.player = new Player({
            x : this.canvas.width/6, 
            y : this.canvas.height/2});        
        // bg floor parts
        this.bg1 = Sprite({
            x : 0, y : this.canvas.height-32,
            color : "#6a8d73",
            width : this.canvas.width,
            height : 32,
            dx : -1
        });
        this.bg2 = Sprite({
            x : this.canvas.width, 
            y : this.canvas.height-32,
            color : "#f4fdd9",
            width : this.canvas.width,
            height : 32,
            dx : -1
        });

        // background boxes
        this.pBg = [];
        for (let i=0;i<10;i++) {
            if (randInt(1,10)<5) {
                // generate 10 background blocks
                let tmp = Sprite({
                    x : randInt(0,this.canvas.width),
                    y : randInt(32, this.canvas.height-32),
                    dx : -0.5 * randInt(1,9),
                    height : randInt(0,this.canvas.height/2),
                    width : 32 + randInt(0,32),
                    color : "#ffe8c2"     
                });
                this.pBg[i] = tmp;
            } else {
                // generate 10 background blocks
                let tmp = Sprite({
                    x : randInt(0,this.canvas.width),
                    y : randInt(32, this.canvas.height-32),
                    dx : -0.5 * randInt(1,9),
                    height : randInt(0,this.canvas.height/2),
                    width : 32 + randInt(0,32),
                    color : "#f0a868"     
                });
                this.pBg[i] = tmp;
            }
        }

        // rockets that can kill
        // the player
        this.rockets = [];
        for(let i=0;i<ROCKET_COUNT;i++) {
            this.rockets.push(Sprite({
                x : this.canvas.width+32,
                y : randInt(32,this.canvas.height-32),
                dx : -10,
                height : 16,
                width : 16,
                color : 'yellow'
            }));
        };

        // handle the end of game message
        // player was kilt
        on("SIG_EOG", this.handle_game_over);


    } // end of constructor

    // called from an emi of SIG_EOG    
    handle_game_over() {
        console.log("GAME OVER!");
    }

    update() {

        // move background floor along
        if (this.bg1.x<-this.canvas.width) 
            this.bg1.x = this.canvas.width;
        
        if (this.bg2.x<-this.canvas.width) this.bg2.x = 
            this.canvas.width;

        // kontra update calls
        this.bg1.update();
        this.bg2.update();

        // background sprites for now
        for (let i=0;i<10;i++) {

            if (this.pBg[i].x+this.pBg[i].width<0) {
                this.pBg[i].x += this.canvas.width+
                    this.pBg[i].width;
            }

            this.pBg[i].update();
        }

        // game logic for rocket death
        if (keyPressed("space")) {
            this.player.rocket = true;
            //player.velocity = player.velocity.add(Vector(0,-10*dt))
            this.player.velocity.y += -11*this._dt;
        } else {
            this.player.rocket = false;
            // gravity
            //player.velocity = player.velocity.add(Vector(0,9.8*dt))
            this.player.velocity.y += 9.8*this._dt;
        }

        // bottom handling
       if (this.player.y>this.canvas.height) {
        this.player.y = this.canvas.height;
        this.player.velocity.y = 0;
       }

       // top handling something is wrong here?
       if (this.player.y<0) {
        this.player.y = 0;
        this.player.velocity.y = 0;
       }

       // update the player
       this.player.update();

       // update rockets
       for(let i=0;i<ROCKET_COUNT;i++) {
            
            // check for collision
            if (collides(this.player,this.rockets[i])) {
                //console.log("COLLIDE");
                // signal end of game
                emit("SIG_EOG");
            }

            // update the rocket position
            this.rockets[i].update();

            // did the rocket go off the screen?
            if (this.rockets[i].x<0) {
                // reset the rocket
                this.rockets[i].y = randInt(32,this.canvas.height-32);
                this.rockets[i].x = this.canvas.width+(randInt(1,3)*16);
            }
        }
        
    }
    
    render() {
            // render the background stuff
        for(let i=0;i<10;i++) {
            this.pBg[i].render();
        }

        // render the floor (forwgroun)
        this.bg1.render();
        this.bg2.render();

        // render the player
        this.player.render();

        // render the rockets
        for(let i=0;i<ROCKET_COUNT;i++) {
            this.rockets[i].render();
        }
        
    }
}
