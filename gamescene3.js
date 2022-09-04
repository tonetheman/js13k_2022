
import {
    Sprite,
    imageAssets,
    keyPressed,
    randInt,
    lerp,
    emit,
    on,
    collides,
    angleToTarget,
    Text
} from "./kontra/kontra.mjs";

// bad guy states
const WAITING = "offscreen_waiting"; // waiting off screen
const COMING = "coming_onscreen"; // moving to onscreen
const FIRING = "firing"; // firing on screen
const INPLACE_IDLE = "inplaceidle"; // hanging out onscreen
const GOING = "going_offscreen"; // leaving the screen

class BadFac {
    static ROCKET_SPEED = -450;
    static BAD_COUNT = 3;

    constructor(parent,canvas,context) {
        this.canvas = canvas;
        this.context = context;
        this.parent = parent;

        this.throwing = 0;

        // player score POD
        this.score = 0;

        // player score object
        this.kscore = Text({
            text : "0",
            font: '32px Arial',
            color: 'white',
            x : 16,
            y : 16       ,
            anchor :  {x : 0.5, y: 0.5},
            textAlign : "center"
        });

        // this is the bad guy list
        this.bads = [];

        // DEFAULT PLACE FOR A ROCKET
        // is off to the right of the canvas
        // we need this to know when it goes
        // off screen
        this.rockets = [];

        for (let i=0;i<BadFac.BAD_COUNT;i++) {
            this.bads.push(Sprite({
                x : this.canvas.width-32, 
                y : 32, // offscreen
                //color : '#0f0',
                image : imageAssets["angel.png"],
                anchor : { x : 0.5, y : 0.5 },
                width : 32, height : 32,
                bstate : WAITING, // default state
                targetx : 0,
                targety : 0,
                lpercent : 0,
                _id : i
            }));
            this.rockets.push(Sprite({
                x : canvas.width+100, // IMPORTANT SEE NOTE
                y : 0,
                dx : 0,
                height : 16,
                width : 16,
                color : 'yellow',
                bstate : WAITING,
                _id : i
            }));
        }


        // the bad has gotten onscreen and in position
        // and needs to fire the missile
        on("FIRE1", (b) =>{
            this.handle_fire1(b);
        });

        // the rocket has left the screen or been destroyed
        // need to move back offscreen
        on("GOING", (b)=> {
            this.handle_going(b);
        });

        // the rocket has hit the player!
        on("ROCKET_HIT", (r) => {
            this.handle_rocket_hit(r);
        });

    }

    handle_rocket_hit(r) {
        // Need to figure out how to handle multi hits
        // a lot of these happen quickly
        // I need a way once one hit happens
        // to ignore others hits for a few seconds
        this.score++;
        this.kscore.text = this.score;   
    }

    handle_going(b) {
        // the rocket left the screen
        // the state of the bad was firing
        b.bstate = GOING;
        b.targetx = this.canvas.width+100,
        b.targety = randInt(0,this.canvas.height)
    }

    handle_fire1(b) {

        // all rockets orig at bad
        this.rockets[b._id].x = b.x;
        this.rockets[b._id].y = b.y;

        // streight shot here directly across
        // speed it moves towards the player
        this.rockets[b._id].dx = BadFac.ROCKET_SPEED;

        // what can i do here?
        // can i translate this to dx and dy?
        let ang = angleToTarget(b,this.parent.player)
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
            if (b.bstate==COMING) {
                // we have arrived
                // then we need to switch to firing
                b.bstate = FIRING;
            } else if (b.bstate==GOING) {
                b.bstate = WAITING; // not doing anything
            } else {
                console.log("ERROR! state was not COMING");
            }
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

    _handle_waiting_state(b,dt) {
    // this controls if the bad comes out
        // or not i think this will need to be lower
        if (Math.random()<0.3) {
            
            this.throwing++; // bump up the throwing count
            
            // change state to coming on to the screen
            b.bstate = COMING;
            
            // give them a target
            // might need an X here too
            b.targety = 
                randInt(0,this.canvas.height);
            b.targetx = this.canvas.width-64;
                
            // where are they in the lerp?
            b.lpercent = 0.0;
        }    
    }

    _handle_coming_state(b,dt) {
        // this will take a step
        // towards the targetx,y and
        // once it arrives it will change
        // state to FIRING
        this.take_step(b,dt,FIRING);
    }

    _hande_firing_state(b,dt) {
        // can be destroyed
        // let a soul/rocket fly

        emit("FIRE1", b);
        b.bstate = INPLACE_IDLE;
    }

    _handle_going_state(b,dt) {
        // can be destroyed while onscreen
        // moving back off screen
        // once we get back to home
        // need to change state
        // need to reduce the number firing
        this.take_step(b,dt,WAITING);
    }

    _handle_inplace_idle(b,dt) {

    }

    handle_state_machine_bad(b,dt) {
        if (b.bstate==WAITING) {
            this._handle_waiting_state(b,dt);
            return;
        }
        if (b.bstate==COMING) {
            this._handle_coming_state(b,dt);
            return;
        }
        if (b.bstate==FIRING) {
            this._hande_firing_state(b,dt);
            return;
        }
        if (b.bstate==GOING) {
            this._handle_going_state(b,dt);
            return;
        }
        if (b.bstate==INPLACE_IDLE) {
            this._handle_inplace_idle(b,dt);
            return;
        }
    }

    update(dt) {

        for(let i=0;i<BadFac.BAD_COUNT;i++) {
            let b = this.bads[i];
    
            this.handle_state_machine_bad(b,dt);

            this.bads[i].update(dt);
        }

        for (let i=0;i<BadFac.BAD_COUNT;i++) {
            let r = this.rockets[i];
            r.update(dt);

            if (collides(r,this.parent.player)) {
                emit("ROCKET_HIT",r);
            };

            // if this rocket goes off screen
            if (r.x<0) {
                // make the rocket not move any more
                r.x = this.canvas.width+100;
                r.y = 0;
                r.dx = 0;
    
                // no longer throwing
                this.throwing--;
    
                // need to signal the bad 
                // to move offscreen again
                if (this.bads[r._id].bstate==INPLACE_IDLE) {
                    // tricky bit here is that the state
                    // needs to be firing ...
                    // so the rocket went off screen and we
                    // were firing so now we need to leave
                    let b = this.bads[r._id];
                    b.bstate = GOING;
                    b.targety = 
                        randInt(0,this.canvas.height);
                    b.targetx = this.canvas.width+100;
                    // where are they in the lerp?
                    b.lpercent = 0.0;
    
                    emit("GOING",this.bads[r._id])                
                }
            }
    
        }

        this.kscore.update();
    }

    render() {
        for(let i=0;i<BadFac.BAD_COUNT;i++) {
            this.bads[i].render();
            this.rockets[i].render();
        }
        this.kscore.render();

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

        this.bf = new BadFac(this,canvas,context);        
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