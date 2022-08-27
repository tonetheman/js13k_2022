
import {
    init,
    GameLoop,
    initInput,
    initPointer,
} from "./kontra/kontra.mjs";
import {
    GameScene
} from "./gamescene";

class SceneManager {
    constructor() {
        this.data = {}
        this.cs = null;
    }
    add(name,scene) {
        this.data[name] = scene;
    }
    set(name) {
        this.cs = this.data[name];
    }
    update(dt) {
        if (this.cs) this.cs.update(dt);
    }
    render() {
        if (this.cs) this.cs.render();
    }
}



// called when window is loaded
function main() {

    // kontra stuff
    let { canvas, context } = init();
    initInput();
    initPointer();
    
    let gs = new GameScene(canvas,context);

    // kontra game loop
    let loop = GameLoop({
        update : (dt) => { 
            // set global dt
            gs._dt=dt; 
            gs.update(); 
        },
        render : () => { 
            gs.render();
         }
    });

    // start the mess
    loop.start();
}

window.onload=main;