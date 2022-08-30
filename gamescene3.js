
import { createImportSpecifier, isThisTypeNode } from "typescript";
import {
    Sprite,
    imageAssets,
    keyPressed,
    initPointer,
    getPointer,
    randInt,
    lerp,
    emit,
    on
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
            bstate : WAITING,
            targetx : 0,
            targety : 0,
            lpercent : 0
        }));

        // DEFAULT PLACE FOR A ROCKET
        // is off to the right of the canvas
        // we need this to know when it goes
        // off screen
        this.rockets = [];
        this.rockets.push(Sprite({
            x : canvas.width+100, // IMPORTANT SEE NOTE
            y : 0,
            dx : 0,
            height : 16,
            width : 16,
            color : 'yellow',
            bstate : WAITING
        }));

        on("FIRE1", (b) =>{
            this.handle_fire1(b);
        });

    }

    handle_fire1(b) {
        this.rockets[0].x = b.x;
        this.rockets[0].y = b.y;
        this.rockets[0].dx = -10;
    }

    // used to move bad to a spot on screen
    // not exactly correct
    // think i need to keep up something   
    // for this to be accurate
    take_step(b,dt,next_state) {
        // can be destroyed in this state
        let step = dt*lerp(b.y,b.targety,b.lpercent);
        b.lpercent += 0.02;
        
        if (b.lpercent>1.0) {
            console.log("setting b.bstate to next_state",next_state)
            b.bstate = next_state;
            return;
        }
        if (b.targety>b.y) {
            b.y += step;
        } else {
            b.y -= step;
        }
        if (b.targetx>b.x) {
            b.x += step;   
        } else {
            b.x -= step;
        }
    }

    update(dt) {

        for(let i=0;i<this.bads.length;i++) {
            let b = this.bads[i];
            console.log(b.bstate);

            if (b.bstate==WAITING) {
                if (Math.random()<0.5) {
                    this.throwing++; // bump up the throwing count
                    b.bstate = COMING;
                    // give them a target
                    // might need an X here too
                    b.targety = 
                        randInt(0,this.canvas.height);
                    b.targetx =
                        randInt(0,this.canvas.width);
                    // where are they in the lerp?
                    b.lpercent = 0.0;
                }

                // we are done with this one
                continue;

            } else if (b.bstate==COMING) {
    
                // this will take a step
                // towards the targetx,y and
                // once it arrives it will change
                // state to FIRING
                this.take_step(b,dt,FIRING);
                continue;

            } else if (b.bstate==FIRING) {
                // can be destroyed
                // let a soul/rocket fly

                emit("FIRE1", b);
                b.bstate = INPLACE_IDLE;

               continue;
    
            } else if (b.bstate==GOING) {
                // can be destroyed while onscreen
                // moving back off screen
                // once we get back to home
                // need to change state
                // need to reduce the number firing
                continue;
            } else if (b.bstate==INPLACE_IDLE) {
                // need to wait until the firing is done
                continue;
            }

            this.bads[i].update(dt);
        }

        this.rockets[0].update();
        if (this.rockets[0].x<0) {

            // make the rocket not move any more
            this.rockets[0].x = -100;
            this.rockets[0].y = -100;
            this.rockets[0].dx = 0;

            // need to signal the bad 
            // to move offscreen again
            if (this.bads[0].bstate==FIRING) {
                // tricky bit here is that the state
                // needs to be firing ...
                // not sure this will hold
                //this.bads[0].bstate = GOING;
            }
        }
    }

    render() {
        for(let i=0;i<this.bads.length;i++) {
            this.bads[i].render();
        }
    
        this.rockets[0].render();
    
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