
import kontra from "./kontra/kontra";

class Player {
    constructor(x,y) {
        // this is separate from the sprite
        this.location = kontra.Vector(x,y);
        this.velocity = kontra.Vector(0,0);
        this.accel = kontra.Vector(0,0);

        this.spr = kontra.Sprite({
            x:x,y:y,
            image : kontra.imageAssets["whitedot_sprite_test1.png"],
            width : 20, height : 20
        })
    }
    update() {
        this.spr.y += 1.5;
        this.spr.update();
    }
    render() {
        this.spr.render();
    }
}

function other_main() {
    let canvas = kontra.getCanvas();

    let bg1 = kontra.Sprite({
        x :0, y : 0,
        height : 600,
        width : 64,
        image : kontra.imageAssets["background.png"],
        dx : 1
    });
    let bg2 = kontra.Sprite({
        x :-800, y : 0,
        height : 600,
        width : 64,
        image : kontra.imageAssets["background.png"],
        dx : 1
    })

    let player = new Player(100,80);

    kontra.onPointer("down", function(e,o) {
        
    });
    kontra.onPointer("up", function(e,o){

    });

    let loop = kontra.GameLoop({
        update : function() {
            bg1.update();
            bg2.update();

            if (bg1.x > 1600) bg1.x = 0;
            if (bg2.x > 800) bg2.x = -800;

            if (kontra.keyPressed("space")) {
                player.spr.y -= 3;
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
            bg2.render();

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