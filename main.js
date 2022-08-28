
import {
    init,
    GameLoop,
    initInput,
    initPointer,
} from "./kontra/kontra.mjs";
import {
    GameScene
} from "./gamescene";

import {
    SceneManager
} from "./scenemanager";


// called when window is loaded
function main() {

    // kontra stuff
    let { canvas, context } = init();
    initInput();
    initPointer();
    
    let sm = new SceneManager();
    let gs = new GameScene(canvas,context);
    sm.add("game1", gs);
    sm.set("game1");
    
    // kontra game loop
    let loop = GameLoop({
        update : (dt) => { 
            // set global dt
            sm._dt=dt; 
            sm.update(); 
        },
        render : () => { 
            sm.render();
         }
    });

    // start the mess
    loop.start();
}

window.onload=main;