

import {
    SpriteClass
} from "./kontra/kontra.mjs";

// custom player instance
// might not need this in the final version?
export class Player extends SpriteClass {
    constructor(props) {
        super({
            ...props,
            dy : 5,
            anchor : { x : 0.5, y : 0.5 },
            radius : 16,
            rocket : false
        });
    }

    draw() {
        let { context, radius } = this;
        if (this.rocket) {
            context.fillStyle = '#ffF';
        } else {
            context.fillStyle = '#f00';
        }
        context.beginPath();
        context.arc(0,0,radius,0,2*Math.PI);
        context.fill();
    }
}
