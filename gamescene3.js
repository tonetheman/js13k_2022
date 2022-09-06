
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
    Text,
    Pool
} from "./kontra/kontra.mjs";

import { BadFac } from "./gs3_badfac.js";

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
        this.player_trail = Pool({
            create : Sprite,
            maxSize : 64 // default is 1024 we do not need much
        });

        // int to hold da score
        this.score = 0;

        // player score object
        this.kscore = Text({
            text : "0",
            font: '32px Arial',
            color: 'white',
            x : 32,
            y : 16       ,
            anchor :  {x : 0.5, y: 0.5},
            textAlign : "center"
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

            this.player_trail.get({
                x : this.player.x+ randInt(-5,5),
                y : this.player.y+16,
                dx : randInt(-20,20),
                dy : randInt(20,40),
                color : '#FDDA0D',
                width : 4, height : 4,
                ttl : 10+randInt(30)
            });
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
        this.player_trail.update(dt);

        this.bf.update(dt);

        this.kscore.update();

    }

    render() {
        this.bg1.render();
        this.bg2.render();
        this.goal.render();
        this.player.render();
        this.player_trail.render();
        this.bf.render();
        this.kscore.render();
    }
}