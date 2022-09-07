
import kontra, {
    init,
    GameLoop,
    Sprite,
    SpriteClass,
    randInt
} from "./kontra.mjs";

// works can i do it shorter
class FS extends SpriteClass {
    constructor(props) {
        super(props);
        this.fakeCanvas = document.createElement("canvas");
        this.fakeCanvas.width = 400;
        this.fakeCanvas.height = 400;
        this.fake_context = this.fakeCanvas.getContext("2d");
        this.fake_context.fillStyle = "green";
        this.fake_context.fillRect(0,0,400,400);    
    }
    draw() {
        this.context.drawImage(this.fakeCanvas,0,0);
    }
}

function make_canvas() {
    let f = document.createElement("canvas");
    f.width = 400;
    f.height = 400;
    let ctx = f.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,400,400);

    for (let i=0;i<1000;i++) {
        let x = randInt(0,400);
        let y = randInt(0,400);
        let r = randInt(1,5);

        ctx.beginPath();
        ctx.arc(x,y,r,0,2*Math.PI,false);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.stroke();
    }
    return f;
}

function main() {
    let {canvas,context} = init();

    let bg1 = Sprite({
        x : 0,
        y : 0,
        width : 400,
        height : 400,
        color : "red",
        dx : -20
    });
    let bg2 = Sprite({
        x : 400,
        y : 0,
        image : make_canvas(),
        dx : -20
    });

    let loop = GameLoop({
        update: (dt) => {
            bg1.update(dt);
            bg2.update(dt);

            if (bg1.x<-400) {
                bg1.x = 400;
            }
            if (bg2.x<-400) {
                bg2.x = 400;
            }
        },
        render: () => {
            bg1.render();
            bg2.render();
        }
    });
    loop.start();


}

window.onload = main;