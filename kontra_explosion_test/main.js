
import {
    GameLoop, init,
    Pool, Sprite,
    randInt, keyPressed, initKeys
} from "./kontra.mjs";

function main() {
    init();
    initKeys();

    let p = Pool({
        create: Sprite,
        maxSize : 64});

    let loop = GameLoop({
        update: (dt) => {
            if (keyPressed("space")) {
                console.log("pressing get",dt);
                for(let i=0;i<16;i++) {
                    p.get({
                        x : 200+ randInt(-5,5),
                        y : 200+randInt(0,16),
                        dx : randInt(-20,20),
                        dy : randInt(20,40),
                        color : '#Ffcc11',
                        width : 4, height : 4,
                        ttl : 10+randInt(30)        
                    });
                }
                
            }
            p.update(dt);
        },
        render: () => {
            p.render();
        }
    });
    loop.start();
}

window.onload = main;