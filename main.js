
import {
    init,
    GameLoop,
    initInput,
    initPointer,
    load,
    emit,
    on,
} from "./kontra/kontra.mjs";

import {
    SceneManager
} from "./scenemanager";

import { GameScene3 } from "./gamescene3.js";
import { TitleScene } from  "./title_scene.js";
import { MenuScene } from "./menu_scene.js";

// called when window is loaded
function gamemain() {

    // kontra stuff
    let { canvas, context } = init();
    initInput();
    initPointer();
    
    let sm = new SceneManager();
    /*
    let gs = new GameScene(canvas,context);
    sm.add("game1", gs);
    //sm.set("game1");
    
    let gs2 = new GameScene2(canvas,context);
    sm.add("game2",gs2);
    //sm.set("game2");
    */

    let ts = new TitleScene(canvas,context);
    sm.add("title",ts);

    let ms = new MenuScene(canvas,context);
    sm.add("menu",ms);
    
    let gs3 = new GameScene3(canvas,context);
    sm.add("game3",gs3);

    //sm.set("game3");
    sm.set("title");

    // the title scene emits this
    // we catch it and switch scenes
    on("TITLE_FINISHED", () => {
        sm.set("menu");
    });
    on("MENU_FINISHED",() => {
        sm.set("game3");
    });

    // kontra game loop
    let loop = GameLoop({
        update : (dt) => { 
            // set global dt
            sm._dt=dt; 
            sm.update(dt); 
        },
        render : () => { 
            sm.render();
         }
    });

    // start the mess
    loop.start();
}


on("main", gamemain);

function main() {
    load("death_v1.png",
        "angel.png").then(()=> {
        emit("main");
    });
}

window.onload=main;