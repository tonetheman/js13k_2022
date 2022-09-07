
import {
    Sprite,
    imageAssets,
    randInt,
    lerp,
    emit,
    on,
    collides,
    angleToTarget,
    Text,
    Pool
} from "./kontra/kontra.mjs";


// bad guy states
const WAITING = "offscreen_waiting"; // waiting off screen
const COMING = "coming_onscreen"; // moving to onscreen
const FIRING = "firing"; // firing on screen
const INPLACE_IDLE = "inplaceidle"; // hanging out onscreen
const GOING = "going_offscreen"; // leaving the screen

// rocket state
const T_ALIVE = 0;
const T_DEAD = -1;

export class BadFac {
    static ROCKET_SPEED_SLOW = -250;
    static ROCKET_SPEED_FAST = -350;

    static BAD_COUNT = 3;

    _create_rocket() {
        return this.rockets.get({
            x : this.canvas.width+100, // IMPORTANT SEE NOTE
            y : 0,
            dx : 0,
            height : 16,
            width : 16,
            color : 'yellow',
            bstate : WAITING,
            ttl : Infinity            
        });
    }

    constructor(parent,canvas,context) {
        this.canvas = canvas;
        this.context = context;
        this.parent = parent;

        this.throwing = 0;

        // this is the bad guy list
        this.bads = [];

        this.rockets = Pool({
            create: Sprite
        });

        this.explosion_pool = Pool({
            create: Sprite
        });

        for (let i=0;i<BadFac.BAD_COUNT;i++) {
            this.bads.push(Sprite({
                x : this.canvas.width-32, 
                y : 32, 
                image : imageAssets["angel.png"],
                anchor : { x : 0.5, y : 0.5 },
                width : 32, height : 32,
                bstate : WAITING, // default state
                targetx : 0,
                targety : 0,
                lpercent : 0,
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

        on("ROCKET_SCORE", (r) => {
            this.handle_rocket_score(r);
        })

        on("ROCKET_BAD_HIT", (b,r) => {
            this.handle_rocket_bad_hit(b,r);
        });
    }

    // a bad guy got hit do something
    handle_rocket_bad_hit(b,r) {

        // TODO: this is not working?
        // it should make particle appear
        // at the bad that was hit
        for(let i=0;i<16;i++) {
            this.explosion_pool.get({
                x : b.x+ randInt(-5,5),
                y : b.y+randInt(0,16),
                dx : randInt(-20,20),
                dy : randInt(20,40),
                color : '#Ffffee',
                width : 4, height : 4,
                ttl : 10+randInt(30)        
            });
        }

        // IT WILL BE SOMETHING LIKE THIS
        // 1. do explosion
        zzfx(...[,,979,.02,.24,.48,3,1.18,-0.1,,50,,,.6,,.9,.01,.44,.18]); // Explosion 38 - Mutation 2

        // DONE 2. move offscreen
        // DONE 3. set state so it can be used again
        b.bstate = WAITING;
        b.x = this.canvas.width+100;
        b.y = randInt(0,this.canvas.height);


        // 4. adjust the score
        this.parent.score += 5;
        this.parent.kscore.text = this.parent.score;

    }

    handle_rocket_score(r) {
        zzfx(...[1.45,,88,,.08,.15,,.72,,6.8,-503,.16,,,36,,.01,.99]); // Random 36

        this.parent.score -= 1;
        this.parent.kscore.text = this.parent.score; 
    }

    handle_rocket_hit(r) {
        // Need to figure out how to handle multi hits
        // a lot of these happen quickly
        // I need a way once one hit happens
        // to ignore others hits for a few seconds
        
        zzfx(...[1.13,,242,,.01,.09,1,,,-0.5,,,,,162,.5,,.72,.09]); // Shoot 31

        r.dx *= -1;
        
        this.parent.score++;
        this.parent.kscore.text = this.parent.score;   
    }

    handle_going(b) {
        // the rocket left the screen
        // the state of the bad was firing
        b.bstate = GOING;
        b.targetx = this.canvas.width+100,
        b.targety = randInt(0,this.canvas.height)
    }

    handle_fire1(b) {

        let r = this._create_rocket();

        // all rockets orig at bad
        // added some to the rocket
        // so it will not collide with bad
        r.x = b.x-32;
        r.y = b.y;

        // set ttl
        r.ttl = Infinity;

        // set the _id needed so we can get back
        // to the bad who fired this rocket
        r._id = b._id;

        // streight shot here directly across
        // speed it moves towards the player
        let choice = randInt(1,10);
        if (choice<5) {
            r.dx = BadFac.ROCKET_SPEED_SLOW;
        } else {
            r.dx = BadFac.ROCKET_SPEED_FAST;
        }

        // what can i do here?
        // can i translate this to dx and dy?
        let ang = angleToTarget(b,this.parent.player)
    }

    // used to move bad to a spot on screen
    // not exactly correct
    // think i need to keep up something   
    // for this to be accurate
    take_step(b,dt) {
        // can be destroyed in this state
        let step = dt*lerp(b.y,b.targety,b.lpercent);
        b.lpercent += 0.01;
        
        if (b.lpercent>1.0) {
            if (b.bstate==COMING) {
                // we have arrived
                // then we need to switch to firing
                b.bstate = FIRING;
            } else if (b.bstate==GOING) {
                b.bstate = WAITING; // not doing anything
                // this completes this bad journey
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
            // -48 to try to keep it on screen
            b.targety = 
                randInt(0,this.canvas.height-48);
            b.targetx = this.canvas.width-96;
                
            // where are they in the lerp?
            b.lpercent = 0.0;
        }    
    }

    _handle_coming_state(b,dt) {
        // this will take a step
        // towards the targetx,y and
        // once it arrives it will change
        // state to FIRING
        this.take_step(b,dt);
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
        this.take_step(b,dt);
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

            b.update(dt);

            for (let i=0;i<this.rockets.objects.length;i++) {
                let r = this.rockets.objects[i];
                if (collides(b,r)) {
                    emit("ROCKET_BAD_HIT",b,r);
                }
            }
        }

        // update the pool of rockets
        this.rockets.update(dt);

        // update the explosion pool
        this.explosion_pool.update(dt);

        // now decide if it is time for the rocket
        // to die
        for (let i=0;i<this.rockets.objects.length;i++) {
            
            // current rocket
            let r = this.rockets.objects[i];

            // check for collision
            // with the player
            if (collides(r,this.parent.player)) {
                emit("ROCKET_HIT",r);
                return;
            };

            // check for a collision with
            // the goal
            if (collides(r,this.parent.goal)) {
                emit("ROCKET_SCORE",r);
                return;
            }

            // it is still alive
            if (r.ttl==Infinity) {

                // and it is either offscreen to the left
                // or the right

                if ((r.x<0) || (r.x>this.canvas.width)) {
                
                    // no longer alive from the pool
                    // point of view
                    r.ttl = 0;

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
        }

    }

    render() {
        for(let i=0;i<BadFac.BAD_COUNT;i++) {
            this.bads[i].render();
        }
        this.rockets.render();
        this.explosion_pool.render();
    }
}
