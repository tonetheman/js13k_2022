
import {
    Sprite,
    imageAssets,
    keyPressed,
    initPointer,
    getPointer,
    randInt,
    lerp
} from "./kontra/kontra.mjs";

// bad guy states
const WAITING = 1; // waiting off screen
const COMING = 2; // moving to onscreen
const INPLACE_IDLE = 3; // hanging out onscreen
const FIRING = 4; // firing on screen
// really goes back to inplace_idle
const GOING = 5; // leaving the screen

class BadFac {
    constructor(canvas,context) {
        this.canvas = canvas;
        this.context = context;

        this.throwing = 0;

        // this is the bad guy list
        this.bads = [];
        this.bads.push(Sprite({
            x : this.canvas.width-32, 
            y : 32, // offscreen
            color : '#0f0',
            anchor : { x : 0.5, y : 0.5 },
            width : 32, height : 32,
            bstate : WAITING
        }));
    }

    update(dt) {
        // state machine:
        // waiting to come out - waiting off screen
        // coming out - moving into a position on screen
        // firing - shoot (creates new sprite)
        // waiting - watching the shot?
        // hiding - moving off screen
        // waiting to come out
        //
        for(let i=0;i<this.bads.length;i++) {
            let b = this.bads[i];

            if (b.bstate==COMING) {
                // can be destroyed in this state
                let step = dt*lerp(b.y,b.targety,1);
                
                b.y += step;

                if (b.y == b.targety) {
                    // once we make it to the target
                    // change state
                    b.state = FIRING;
                }
            } else if (b.bstate==FIRING) {
                // can be destroyed
                // let a soul/rocket fly
            } else if (b.bstate==WAITING) {
                // can be destroyed
                // watching for the rocket/soul to hit
                
            } else if (b.bstate==HIDING) {
                // can be destroyed while onscreen
                // moving back off screen
                // once we get back to home
                // need to change state
                // need to reduce the number firing
            }

            this.bads[i].update(dt);
        }

        if (this.throwing==0) {
            if (Math.random()<0.5) {
                // start someone throwing
                this.throwing = 1;

                // change state
                this.bads[0].bstate = COMING;
                
                // give them a target
                // might need an X here too
                this.bads[0].targety = 
                    randInt(0,this.canvas.height);
            }
        }
    }
    render() {
        for(let i=0;i<this.bads.length;i++) {
            this.bads[i].render();
        }
    }
}

// this is a test of the soccer idea
// need a collider sprite behind the
// player
export class GameScene3 {
    constructor(canvas,context) {
        this.canvas = canvas;
        this.context = context;
        
        this.player = Sprite({
            x : this.canvas.width/6, 
            y : this.canvas.height/2,
            anchor: {x: 0.5, y: 0.5},
            image : imageAssets["death_v1.png"]
        });

        // will use this as something 
        // that will be a collider
        this.goal = Sprite({
            x : this.canvas.width/14,
            y : this.canvas.height/2,
            anchor : { x : 0.5, y : 0.5 },
            width : 16,
            height : 400,
            color : '#f00'
        });

        // bg floor parts
        this.bg1 = Sprite({
            x : 0, y : this.canvas.height-16,
            //color : "#6a8d73",
            image : imageAssets["long_bottom.png"],
            anchor : { x : 0.5, y : 0.5 },
            width : this.canvas.width,
            height : 32,
            dx : -100
        });
        this.bg2 = Sprite({
            x : this.canvas.width, 
            y : this.canvas.height-16,
            //color : "#f4fdd9",
            image : imageAssets["long_bottom.png"],
            anchor : { x : 0.5, y : 0.5 },
            width : this.canvas.width,
            height : 32,
            dx : -100
        });

        this.bf = new BadFac(canvas,context);

        console.log("gamescene3 loaded");
    }

    update(dt) {
                
        // move background floor along
        if (this.bg1.x<-this.canvas.width) {
            this.bg1.x = this.canvas.width;
        }

        if (this.bg2.x<-this.canvas.width) {
            this.bg2.x = this.canvas.width;
        }
    
        // if you pass dt to these the bottom will move
        // super slow
        this.bg1.update(dt);
        this.bg2.update(dt);

        this.goal.update(dt); // should not move

        // game logic for rocket death
        if (keyPressed("space")) {
            //player.velocity = player.velocity.add(Vector(0,-10*dt))
            this.player.velocity.y += -500*dt;
        } else {
            // gravity
            //player.velocity = player.velocity.add(Vector(0,9.8*dt))
            this.player.velocity.y += 400*dt;
        }

        // bottom handling
       if (this.player.y>this.canvas.height-32) {
        this.player.y = this.canvas.height-32;
        this.player.velocity.y = 0;
       }

       // top handling something is wrong here?
       if (this.player.y<0) {
        this.player.y = 0;
        this.player.velocity.y = 0;
       }

        this.player.update(dt);
        
        this.bf.update(dt);

    }

    render() {
        this.bg1.render();
        this.bg2.render();
        this.goal.render();
        this.player.render();
        this.bf.render();
    }
}