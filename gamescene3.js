
import {
    Sprite,
    imageAssets,
    keyPressed,
    on,
    initPointer,
    getPointer
} from "./kontra/kontra.mjs";

// bad guy states
const WAITING = 1; // waiting off screen
const COMING = 2; // moving to onscreen
const INPLACE_IDLE = 3; // hanging out onscreen
const FIRING = 4; // firing on screen
// really goes back to inplace_idle
const GOING = 5; // leaving the screen


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

        initPointer(); // added to get bads to appear

        console.log("gamescene3 loaded");
    }

    update(dt) {
        
        console.log(getPointer());
        
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

        // does a bad guy need to come up and shoot?
        // state machine:
        // waiting to come out - waiting off screen
        // coming out - moving into a position on screen
        // firing - shoot (creates new sprite)
        // waiting - watching the shot?
        // hiding - moving off screen
        // waiting to come out
        //
        for(let i=0;i<this.bads.length;i++) {
            this.bads[i].update(dt);
        }
    }

    render() {
        this.bg1.render();
        this.bg2.render();
        this.goal.render();
        this.player.render();
        for (let i=0;i<this.bads.length;i++) {
            this.bads[i].render();
        }
    }
}