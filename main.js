
import kontra from "./kontra/kontra";


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

    let sprite = kontra.Sprite({
        x:100, y:80,
        //color: "red",
        image : kontra.imageAssets["whitedot_sprite_test1.png"],
        width : 20, height : 20,
        dy : 1
    });

    kontra.onPointer("down", function(e,o) {
        //sprite.y -= 2;
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
                sprite.y -= 3;
            }
            sprite.update();

            if (sprite.x > canvas.width) {
                sprite.x = 0;
            }

            if (sprite.y > canvas.height) {
                sprite.y = -10;
            }

        },
        render : function() {
            bg1.render();
            bg2.render();

            sprite.render();
        }
    });
    loop.start();

}

function main() {

        
    kontra.init();
    kontra.initInput();
    kontra.initPointer();
    kontra.initKeys();

    kontra.load("whitedot_sprite_test1.png",
        "background.png")
    .then(function(){
        other_main();
    });

}

window.onload = main;