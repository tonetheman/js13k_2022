
import kontra from "./kontra/kontra";

class Player {
    constructor(x,y) {
        // this is separate from the sprite
        this.location = kontra.Vector(x,y);
        this.velocity = kontra.Vector(0,0);
        this.accel = kontra.Vector(0,0);

        this.spr = kontra.Sprite({
            x:x,y:y,
            image : 
                kontra.imageAssets["whitedot_sprite_test1.png"]
        })
    }
    applyForce(scalarY) {
        // just apply to y
        this.accel.add(kontra.Vector(0,scalarY));
    }
    update() {
        // gravity
        //this.spr.y += 1.5;
        this.applyForce(1.5);

        // add accel to velocity
        this.velocity.add(this.accel);
        // actually move here
        this.location.add(this.velocity);

        // match up the sprite now
        this.spr.x = this.location.x;
        this.spr.y = this.location.y;

        //? do i need to call this?
        //this.spr.update();

        // reset the accel vector
        this.accel.x = 0; this.accel.y = 0;
    }
    render() {
        this.spr.render();
    }
}

function other_main() {
    let canvas = kontra.getCanvas();

    let bg1 = kontra.Sprite({
        dx : 1,
        image : kontra.imageAssets["background.png"],
        update : function() {
            this.advance(); // kontra stuff
            if (this.x>canvas.width) {
                this.x = 0;
            }
        },
        render : function() {
            this.draw();
        }
    })


    let player = new Player(100,80);

    kontra.onPointer("down", function(e,o) {
        
    });
    kontra.onPointer("up", function(e,o){

    });

    let loop = kontra.GameLoop({
        update : function() {
            bg1.update();

            if (kontra.keyPressed("space")) {
                //player.spr.y -= 3;
                player.applyForce(-3);
            }
            player.update();

            if (player.spr.x > canvas.width) {
                player.spr.x = 0;
            }

            if (player.spr.y > canvas.height) {
                player.spr.y = -10;
            }

        },
        render : function() {
            bg1.render();
            player.render();
        }
    });
    loop.start();

}

function main() {

        
    kontra.init();
    kontra.initInput();
    kontra.initPointer();
    kontra.initKeys();

    kontra.load(
        "whitedot_sprite_test1.png",
        "background.png")
    .then(function(){
        other_main();
    });

}

window.onload = main;