
export class SceneManager {
    constructor() {
        this.data = {}
        this.cs = null;
        this._dt = 0.0;
    }
    add(name,scene) {
        this.data[name] = scene;
    }
    set(name) {
        this.cs = this.data[name];
    }
    update() {
        if (this.cs) this.cs.update(this._dt);
    }
    render() {
        if (this.cs) this.cs.render();
    }
}
