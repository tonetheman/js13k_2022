(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // kontra/kontra.mjs
  var noop = () => {
  };
  var callbacks$2 = {};
  function on(event, callback) {
    callbacks$2[event] = callbacks$2[event] || [];
    callbacks$2[event].push(callback);
  }
  function emit(event, ...args) {
    (callbacks$2[event] || []).map((fn) => fn(...args));
  }
  var canvasEl;
  var context;
  var handler$1 = {
    get(target, key) {
      if (key == "_proxy")
        return true;
      return noop;
    }
  };
  function getCanvas() {
    return canvasEl;
  }
  function getContext() {
    return context;
  }
  function init$1(canvas, { contextless = false } = {}) {
    canvasEl = document.getElementById(canvas) || canvas || document.querySelector("canvas");
    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }
    context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;
    emit("init");
    return { canvas: canvasEl, context };
  }
  var imageRegex = /(jpeg|jpg|gif|png|webp)$/;
  var audioRegex = /(wav|mp3|ogg|aac)$/;
  var leadingSlash = /^\//;
  var trailingSlash = /\/$/;
  var dataMap = /* @__PURE__ */ new WeakMap();
  var imagePath = "";
  var audioPath = "";
  var dataPath = "";
  function getUrl(url, base) {
    return new URL(url, base).href;
  }
  function joinPath(base, url) {
    return [
      base.replace(trailingSlash, ""),
      base ? url.replace(leadingSlash, "") : url
    ].filter((s) => s).join("/");
  }
  function getExtension(url) {
    return url.split(".").pop();
  }
  function getName(url) {
    let name = url.replace("." + getExtension(url), "");
    return name.split("/").length == 2 ? name.replace(leadingSlash, "") : name;
  }
  function getCanPlay(audio) {
    return {
      wav: audio.canPlayType('audio/wav; codecs="1"'),
      mp3: audio.canPlayType("audio/mpeg;"),
      ogg: audio.canPlayType('audio/ogg; codecs="vorbis"'),
      aac: audio.canPlayType("audio/aac;")
    };
  }
  var imageAssets = {};
  var audioAssets = {};
  var dataAssets = {};
  function addGlobal() {
    if (!window.__k) {
      window.__k = {
        dm: dataMap,
        u: getUrl,
        d: dataAssets,
        i: imageAssets
      };
    }
  }
  function loadImage(url) {
    addGlobal();
    return new Promise((resolve, reject) => {
      let resolvedUrl, image, fullUrl;
      resolvedUrl = joinPath(imagePath, url);
      if (imageAssets[resolvedUrl])
        return resolve(imageAssets[resolvedUrl]);
      image = new Image();
      image.onload = function loadImageOnLoad() {
        fullUrl = getUrl(resolvedUrl, window.location.href);
        imageAssets[getName(url)] = imageAssets[resolvedUrl] = imageAssets[fullUrl] = this;
        emit("assetLoaded", this, url);
        resolve(this);
      };
      image.onerror = function loadImageOnError() {
        reject(
          resolvedUrl
        );
      };
      image.src = resolvedUrl;
    });
  }
  function loadAudio(url) {
    return new Promise((resolve, reject) => {
      let _url = url, audioEl, canPlay, resolvedUrl, fullUrl;
      audioEl = new Audio();
      canPlay = getCanPlay(audioEl);
      url = [].concat(url).reduce(
        (playableSource, source) => playableSource ? playableSource : canPlay[getExtension(source)] ? source : null,
        0
      );
      if (!url) {
        return reject(
          _url
        );
      }
      resolvedUrl = joinPath(audioPath, url);
      if (audioAssets[resolvedUrl])
        return resolve(audioAssets[resolvedUrl]);
      audioEl.addEventListener("canplay", function loadAudioOnLoad() {
        fullUrl = getUrl(resolvedUrl, window.location.href);
        audioAssets[getName(url)] = audioAssets[resolvedUrl] = audioAssets[fullUrl] = this;
        emit("assetLoaded", this, url);
        resolve(this);
      });
      audioEl.onerror = function loadAudioOnError() {
        reject(
          resolvedUrl
        );
      };
      audioEl.src = resolvedUrl;
      audioEl.load();
    });
  }
  function loadData(url) {
    addGlobal();
    let resolvedUrl, fullUrl;
    resolvedUrl = joinPath(dataPath, url);
    if (dataAssets[resolvedUrl])
      return Promise.resolve(dataAssets[resolvedUrl]);
    return fetch(resolvedUrl).then((response) => {
      if (!response.ok)
        throw response;
      return response.clone().json().catch(() => response.text());
    }).then((response) => {
      fullUrl = getUrl(resolvedUrl, window.location.href);
      if (typeof response == "object") {
        dataMap.set(response, fullUrl);
      }
      dataAssets[getName(url)] = dataAssets[resolvedUrl] = dataAssets[fullUrl] = response;
      emit("assetLoaded", response, url);
      return response;
    });
  }
  function load(...urls) {
    addGlobal();
    return Promise.all(
      urls.map((asset) => {
        let extension = getExtension([].concat(asset)[0]);
        return extension.match(imageRegex) ? loadImage(asset) : extension.match(audioRegex) ? loadAudio(asset) : loadData(asset);
      })
    );
  }
  function angleToTarget(source, target) {
    return Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
  }
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }
  function randInt(min, max) {
    return (Math.random() * (max - min + 1) | 0) + min;
  }
  function lerp(start, end, percent) {
    return start * (1 - percent) + end * percent;
  }
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }
  function collides(obj1, obj2) {
    [obj1, obj2] = [obj1, obj2].map((obj) => getWorldRect(obj));
    return obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y;
  }
  function getWorldRect(obj) {
    let { x = 0, y = 0, width, height } = obj.world || obj;
    if (obj.mapwidth) {
      width = obj.mapwidth;
      height = obj.mapheight;
    }
    if (obj.anchor) {
      x -= width * obj.anchor.x;
      y -= height * obj.anchor.y;
    }
    return {
      x,
      y,
      width,
      height
    };
  }
  var Vector = class {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);
        this.x = x;
        this.y = y;
      }
    }
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }
    length() {
      return Math.hypot(this.x, this.y);
    }
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }
    get x() {
      return this._x;
    }
    get y() {
      return this._y;
    }
    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }
    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
    }
  };
  function factory$a() {
    return new Vector(...arguments);
  }
  var Updatable = class {
    constructor(properties) {
      return this.init(properties);
    }
    init(properties = {}) {
      this.position = factory$a();
      this.velocity = factory$a();
      this.acceleration = factory$a();
      this.ttl = Infinity;
      Object.assign(this, properties);
    }
    update(dt) {
      this.advance(dt);
    }
    advance(dt) {
      let acceleration = this.acceleration;
      this.velocity = this.velocity.add(acceleration);
      let velocity = this.velocity;
      this.position = this.position.add(velocity);
      this._pc();
      this.ttl--;
    }
    get dx() {
      return this.velocity.x;
    }
    get dy() {
      return this.velocity.y;
    }
    set dx(value) {
      this.velocity.x = value;
    }
    set dy(value) {
      this.velocity.y = value;
    }
    get ddx() {
      return this.acceleration.x;
    }
    get ddy() {
      return this.acceleration.y;
    }
    set ddx(value) {
      this.acceleration.x = value;
    }
    set ddy(value) {
      this.acceleration.y = value;
    }
    isAlive() {
      return this.ttl > 0;
    }
    _pc() {
    }
  };
  var GameObject = class extends Updatable {
    init({
      width = 0,
      height = 0,
      context: context2 = getContext(),
      render = this.draw,
      update = this.advance,
      anchor = { x: 0, y: 0 },
      rotation = 0,
      ...props
    } = {}) {
      super.init({
        width,
        height,
        context: context2,
        anchor,
        rotation,
        ...props
      });
      this._di = true;
      this._uw();
      this._rf = render;
      this._uf = update;
    }
    update(dt) {
      this._uf(dt);
    }
    render() {
      let context2 = this.context;
      context2.save();
      if (this.x || this.y) {
        context2.translate(this.x, this.y);
      }
      if (this.rotation) {
        context2.rotate(this.rotation);
      }
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;
      if (anchorX || anchorY) {
        context2.translate(anchorX, anchorY);
      }
      this._rf();
      if (anchorX || anchorY) {
        context2.translate(-anchorX, -anchorY);
      }
      context2.restore();
    }
    draw() {
    }
    _pc() {
      this._uw();
    }
    get x() {
      return this.position.x;
    }
    get y() {
      return this.position.y;
    }
    set x(value) {
      this.position.x = value;
      this._pc();
    }
    set y(value) {
      this.position.y = value;
      this._pc();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._w = value;
      this._pc();
    }
    get height() {
      return this._h;
    }
    set height(value) {
      this._h = value;
      this._pc();
    }
    _uw() {
      if (!this._di)
        return;
      let {
        _wx = 0,
        _wy = 0,
        _wr = 0
      } = this.parent || {};
      this._wx = this.x;
      this._wy = this.y;
      this._ww = this.width;
      this._wh = this.height;
      this._wr = _wr + this.rotation;
      let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
      this._wx = x;
      this._wy = y;
    }
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,
        rotation: this._wr
      };
    }
    get rotation() {
      return this._rot;
    }
    set rotation(value) {
      this._rot = value;
      this._pc();
    }
  };
  var Sprite = class extends GameObject {
    init({
      ...props
    } = {}) {
      super.init({
        ...props
      });
    }
    draw() {
      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  };
  function factory$8() {
    return new Sprite(...arguments);
  }
  var fontSizeRegex = /(\d+)(\w+)/;
  function parseFont(font) {
    let match = font.match(fontSizeRegex);
    let size = +match[1];
    let unit = match[2];
    let computed = size;
    return {
      size,
      unit,
      computed
    };
  }
  var Text = class extends GameObject {
    init({
      text = "",
      textAlign = "",
      lineHeight = 1,
      font = getContext().font,
      ...props
    } = {}) {
      text = "" + text;
      super.init({
        text,
        textAlign,
        lineHeight,
        font,
        ...props
      });
      this._p();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._d = true;
      this._w = value;
      this._fw = value;
    }
    get text() {
      return this._t;
    }
    set text(value) {
      this._d = true;
      this._t = "" + value;
    }
    get font() {
      return this._f;
    }
    set font(value) {
      this._d = true;
      this._f = value;
      this._fs = parseFont(value).computed;
    }
    get lineHeight() {
      return this._lh;
    }
    set lineHeight(value) {
      this._d = true;
      this._lh = value;
    }
    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }
    _p() {
      this._s = [];
      this._d = false;
      let context2 = this.context;
      context2.font = this.font;
      if (!this._s.length && this.text.includes("\n")) {
        let width = 0;
        this.text.split("\n").map((str) => {
          this._s.push(str);
          width = Math.max(width, context2.measureText(str).width);
        });
        this._w = this._fw || width;
      }
      if (!this._s.length) {
        this._s.push(this.text);
        this._w = this._fw || context2.measureText(this.text).width;
      }
      this.height = this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
      this._uw();
    }
    draw() {
      let alignX = 0;
      let textAlign = this.textAlign;
      let context2 = this.context;
      textAlign = this.textAlign || (context2.canvas.dir == "rtl" ? "right" : "left");
      alignX = textAlign == "right" ? this.width : textAlign == "center" ? this.width / 2 | 0 : 0;
      this._s.map((str, index) => {
        context2.textBaseline = "top";
        context2.textAlign = textAlign;
        context2.fillStyle = this.color;
        context2.font = this.font;
        context2.fillText(
          str,
          alignX,
          this._fs * this.lineHeight * index
        );
      });
    }
  };
  function factory$7() {
    return new Text(...arguments);
  }
  var pointers = /* @__PURE__ */ new WeakMap();
  var callbacks$1 = {};
  var pressedButtons = {};
  var pointerMap = {
    0: "left",
    1: "middle",
    2: "right"
  };
  function circleRectCollision(object, pointer) {
    let { x, y, width, height } = getWorldRect(object);
    do {
      x -= object.sx || 0;
      y -= object.sy || 0;
    } while (object = object.parent);
    let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
    let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
    return dx * dx + dy * dy < pointer.radius * pointer.radius;
  }
  function getCurrentObject(pointer) {
    let renderedObjects = pointer._lf.length ? pointer._lf : pointer._cf;
    for (let i = renderedObjects.length - 1; i >= 0; i--) {
      let object = renderedObjects[i];
      let collides2 = object.collidesWithPointer ? object.collidesWithPointer(pointer) : circleRectCollision(object, pointer);
      if (collides2) {
        return object;
      }
    }
  }
  function getPropValue(style, value) {
    return parseFloat(style.getPropertyValue(value)) || 0;
  }
  function getCanvasOffset(pointer) {
    let { canvas, _s } = pointer;
    let rect = canvas.getBoundingClientRect();
    let transform = _s.transform != "none" ? _s.transform.replace("matrix(", "").split(",") : [1, 1, 1, 1];
    let transformScaleX = parseFloat(transform[0]);
    let transformScaleY = parseFloat(transform[3]);
    let borderWidth = (getPropValue(_s, "border-left-width") + getPropValue(_s, "border-right-width")) * transformScaleX;
    let borderHeight = (getPropValue(_s, "border-top-width") + getPropValue(_s, "border-bottom-width")) * transformScaleY;
    let paddingWidth = (getPropValue(_s, "padding-left") + getPropValue(_s, "padding-right")) * transformScaleX;
    let paddingHeight = (getPropValue(_s, "padding-top") + getPropValue(_s, "padding-bottom")) * transformScaleY;
    return {
      scaleX: (rect.width - borderWidth - paddingWidth) / canvas.width,
      scaleY: (rect.height - borderHeight - paddingHeight) / canvas.height,
      offsetX: rect.left + (getPropValue(_s, "border-left-width") + getPropValue(_s, "padding-left")) * transformScaleX,
      offsetY: rect.top + (getPropValue(_s, "border-top-width") + getPropValue(_s, "padding-top")) * transformScaleY
    };
  }
  function pointerDownHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = true;
    pointerHandler(evt, "onDown");
  }
  function pointerUpHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = false;
    pointerHandler(evt, "onUp");
  }
  function mouseMoveHandler(evt) {
    pointerHandler(evt, "onOver");
  }
  function blurEventHandler$2(evt) {
    let pointer = pointers.get(evt.target);
    pointer._oo = null;
    pressedButtons = {};
  }
  function callCallback(pointer, eventName, evt) {
    let object = getCurrentObject(pointer);
    if (object && object[eventName]) {
      object[eventName](evt);
    }
    if (callbacks$1[eventName]) {
      callbacks$1[eventName](evt, object);
    }
    if (eventName == "onOver") {
      if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
        pointer._oo.onOut(evt);
      }
      pointer._oo = object;
    }
  }
  function pointerHandler(evt, eventName) {
    evt.preventDefault();
    let canvas = evt.target;
    let pointer = pointers.get(canvas);
    let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
    let isTouchEvent = evt.type.includes("touch");
    if (isTouchEvent) {
      Array.from(evt.touches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          if (!touch) {
            touch = pointer.touches[identifier] = {
              start: {
                x: (clientX - offsetX) / scaleX,
                y: (clientY - offsetY) / scaleY
              }
            };
            pointer.touches.length++;
          }
          touch.changed = false;
        }
      );
      Array.from(evt.changedTouches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          touch.changed = true;
          touch.x = pointer.x = (clientX - offsetX) / scaleX;
          touch.y = pointer.y = (clientY - offsetY) / scaleY;
          callCallback(pointer, eventName, evt);
          emit("touchChanged", evt, pointer.touches);
          if (eventName == "onUp") {
            delete pointer.touches[identifier];
            pointer.touches.length--;
            if (!pointer.touches.length) {
              emit("touchEnd");
            }
          }
        }
      );
    } else {
      pointer.x = (evt.clientX - offsetX) / scaleX;
      pointer.y = (evt.clientY - offsetY) / scaleY;
      callCallback(pointer, eventName, evt);
    }
  }
  function initPointer({
    radius = 5,
    canvas = getCanvas()
  } = {}) {
    let pointer = pointers.get(canvas);
    if (!pointer) {
      let style = window.getComputedStyle(canvas);
      pointer = {
        x: 0,
        y: 0,
        radius,
        touches: { length: 0 },
        canvas,
        _cf: [],
        _lf: [],
        _o: [],
        _oo: null,
        _s: style
      };
      pointers.set(canvas, pointer);
    }
    canvas.addEventListener("mousedown", pointerDownHandler);
    canvas.addEventListener("touchstart", pointerDownHandler);
    canvas.addEventListener("mouseup", pointerUpHandler);
    canvas.addEventListener("touchend", pointerUpHandler);
    canvas.addEventListener("touchcancel", pointerUpHandler);
    canvas.addEventListener("blur", blurEventHandler$2);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", mouseMoveHandler);
    if (!pointer._t) {
      pointer._t = true;
      on("tick", () => {
        pointer._lf.length = 0;
        pointer._cf.map((object) => {
          pointer._lf.push(object);
        });
        pointer._cf.length = 0;
      });
    }
    return pointer;
  }
  function clear(context2) {
    let canvas = context2.canvas;
    context2.clearRect(0, 0, canvas.width, canvas.height);
  }
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context: context2 = getContext(),
    blur = false
  } = {}) {
    let accumulator = 0;
    let delta = 1e3 / fps;
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop;
    let focused = true;
    if (!blur) {
      window.addEventListener("focus", () => {
        focused = true;
      });
      window.addEventListener("blur", () => {
        focused = false;
      });
    }
    function frame() {
      rAF = requestAnimationFrame(frame);
      if (!focused)
        return;
      now = performance.now();
      dt = now - last;
      last = now;
      if (dt > 1e3) {
        return;
      }
      emit("tick");
      accumulator += dt;
      while (accumulator >= delta) {
        loop.update(step);
        accumulator -= delta;
      }
      clearFn(context2);
      loop.render();
    }
    loop = {
      update,
      render,
      isStopped: true,
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      }
    };
    return loop;
  }
  var gamepads = [];
  var gamepaddownCallbacks = {};
  var gamepadupCallbacks = {};
  var gamepadMap = {
    0: "south",
    1: "east",
    2: "west",
    3: "north",
    4: "leftshoulder",
    5: "rightshoulder",
    6: "lefttrigger",
    7: "righttrigger",
    8: "select",
    9: "start",
    10: "leftstick",
    11: "rightstick",
    12: "dpadup",
    13: "dpaddown",
    14: "dpadleft",
    15: "dpadright"
  };
  function gamepadConnectedHandler(event) {
    gamepads[event.gamepad.index] = {
      pressedButtons: {},
      axes: {}
    };
  }
  function gamepadDisconnectedHandler(event) {
    delete gamepads[event.gamepad.index];
  }
  function blurEventHandler$1() {
    gamepads.map((gamepad) => {
      gamepad.pressedButtons = {};
      gamepad.axes = {};
    });
  }
  function updateGamepad() {
    let pads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
    for (let i = 0; i < pads.length; i++) {
      let gamepad = pads[i];
      if (!gamepad) {
        continue;
      }
      gamepad.buttons.map((button, index) => {
        let buttonName = gamepadMap[index];
        let { pressed } = button;
        let { pressedButtons: pressedButtons2 } = gamepads[gamepad.index];
        let state = pressedButtons2[buttonName];
        if (!state && pressed) {
          [
            gamepaddownCallbacks[gamepad.index],
            gamepaddownCallbacks
          ].map((callback) => {
            callback?.[buttonName]?.(gamepad, button);
          });
        } else if (state && !pressed) {
          [gamepadupCallbacks[gamepad.index], gamepadupCallbacks].map(
            (callback) => {
              callback?.[buttonName]?.(gamepad, button);
            }
          );
        }
        pressedButtons2[buttonName] = pressed;
      });
      let { axes } = gamepads[gamepad.index];
      axes.leftstickx = gamepad.axes[0];
      axes.leftsticky = gamepad.axes[1];
      axes.rightstickx = gamepad.axes[2];
      axes.rightsticky = gamepad.axes[3];
    }
  }
  function initGamepad() {
    window.addEventListener(
      "gamepadconnected",
      gamepadConnectedHandler
    );
    window.addEventListener(
      "gamepaddisconnected",
      gamepadDisconnectedHandler
    );
    window.addEventListener("blur", blurEventHandler$1);
    on("tick", updateGamepad);
  }
  var callbacks = {};
  var currGesture;
  var init = false;
  var gestureMap = {
    swipe: {
      touches: 1,
      threshold: 10,
      touchend({ 0: touch }) {
        let x = touch.x - touch.start.x;
        let y = touch.y - touch.start.y;
        let absX = Math.abs(x);
        let absY = Math.abs(y);
        if (absX < this.threshold && absY < this.threshold)
          return;
        return absX > absY ? x < 0 ? "left" : "right" : y < 0 ? "up" : "down";
      }
    },
    pinch: {
      touches: 2,
      threshold: 2,
      touchstart({ 0: touch0, 1: touch1 }) {
        this.prevDist = Math.hypot(
          touch0.x - touch1.x,
          touch0.y - touch1.y
        );
      },
      touchmove({ 0: touch0, 1: touch1 }) {
        let dist = Math.hypot(touch0.x - touch1.x, touch0.y - touch1.y);
        if (Math.abs(dist - this.prevDist) < this.threshold)
          return;
        let dir = dist > this.prevDist ? "out" : "in";
        this.prevDist = dist;
        return dir;
      }
    }
  };
  function initGesture() {
    if (!init) {
      init = true;
      on("touchChanged", (evt, touches) => {
        Object.keys(gestureMap).map((name) => {
          let gesture = gestureMap[name];
          let type;
          if ((!currGesture || currGesture == name) && touches.length == gesture.touches && [...Array(touches.length).keys()].every(
            (key) => touches[key]
          ) && (type = gesture[evt.type]?.(touches) ?? "") && callbacks[name + type]) {
            currGesture = name;
            callbacks[name + type](evt, touches);
          }
        });
      });
      on("touchEnd", () => {
        currGesture = 0;
      });
    }
  }
  var keydownCallbacks = {};
  var keyupCallbacks = {};
  var pressedKeys = {};
  var keyMap = {
    Enter: "enter",
    Escape: "esc",
    Space: "space",
    ArrowLeft: "arrowleft",
    ArrowUp: "arrowup",
    ArrowRight: "arrowright",
    ArrowDown: "arrowdown"
  };
  function call(callback = noop, evt) {
    if (callback._pd) {
      evt.preventDefault();
    }
    callback(evt);
  }
  function keydownEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keydownCallbacks[key];
    pressedKeys[key] = true;
    call(callback, evt);
  }
  function keyupEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keyupCallbacks[key];
    pressedKeys[key] = false;
    call(callback, evt);
  }
  function blurEventHandler() {
    pressedKeys = {};
  }
  function initKeys() {
    let i;
    for (i = 0; i < 26; i++) {
      keyMap["Key" + String.fromCharCode(i + 65)] = String.fromCharCode(
        i + 97
      );
    }
    for (i = 0; i < 10; i++) {
      keyMap["Digit" + i] = keyMap["Numpad" + i] = "" + i;
    }
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("blur", blurEventHandler);
  }
  function keyPressed(key) {
    return !!pressedKeys[key];
  }
  function initInput(options = {}) {
    initKeys();
    let pointer = initPointer(options.pointer);
    initGesture();
    initGamepad();
    return { pointer };
  }
  var Pool = class {
    constructor({ create, maxSize = 1024 } = {}) {
      this._c = create;
      this.objects = [create()];
      this.size = 0;
      this.maxSize = maxSize;
    }
    get(properties = {}) {
      if (this.size == this.objects.length) {
        if (this.size == this.maxSize) {
          return;
        }
        for (let i = 0; i < this.size && this.objects.length < this.maxSize; i++) {
          this.objects.push(this._c());
        }
      }
      let obj = this.objects[this.size];
      this.size++;
      obj.init(properties);
      return obj;
    }
    getAliveObjects() {
      return this.objects.slice(0, this.size);
    }
    clear() {
      this.size = this.objects.length = 0;
      this.objects.push(this._c());
    }
    update(dt) {
      let obj;
      let doSort = false;
      for (let i = this.size; i--; ) {
        obj = this.objects[i];
        obj.update(dt);
        if (!obj.isAlive()) {
          doSort = true;
          this.size--;
        }
      }
      if (doSort) {
        this.objects.sort((a, b) => b.isAlive() - a.isAlive());
      }
    }
    render() {
      for (let i = this.size; i--; ) {
        this.objects[i].render();
      }
    }
  };
  function factory$4() {
    return new Pool(...arguments);
  }

  // scenemanager.js
  var SceneManager = class {
    constructor() {
      this.data = {};
      this.cs = null;
      this._dt = 0;
    }
    add(name, scene) {
      this.data[name] = scene;
    }
    set(name) {
      this.cs = this.data[name];
    }
    update() {
      if (this.cs)
        this.cs.update(this._dt);
    }
    render() {
      if (this.cs)
        this.cs.render();
    }
  };

  // gs3_badfac.js
  var WAITING = "offscreen_waiting";
  var COMING = "coming_onscreen";
  var FIRING = "firing";
  var INPLACE_IDLE = "inplaceidle";
  var GOING = "going_offscreen";
  var _BadFac = class {
    _create_rocket() {
      return this.rockets.get({
        x: this.canvas.width + 100,
        y: 0,
        dx: 0,
        height: 16,
        width: 16,
        color: "yellow",
        bstate: WAITING,
        ttl: Infinity
      });
    }
    constructor(parent, canvas, context2) {
      this.canvas = canvas;
      this.context = context2;
      this.parent = parent;
      this.throwing = 0;
      this.bads = [];
      this.rockets = factory$4({
        create: factory$8
      });
      this.explosion_pool = factory$4({
        create: factory$8
      });
      for (let i = 0; i < _BadFac.BAD_COUNT; i++) {
        this.bads.push(factory$8({
          x: this.canvas.width - 32,
          y: 32,
          image: imageAssets["angel.png"],
          anchor: { x: 0.5, y: 0.5 },
          width: 32,
          height: 32,
          bstate: WAITING,
          targetx: 0,
          targety: 0,
          lpercent: 0,
          _id: i
        }));
      }
      on("FIRE1", (b) => {
        this.handle_fire1(b);
      });
      on("GOING", (b) => {
        this.handle_going(b);
      });
      on("ROCKET_HIT", (r) => {
        this.handle_rocket_hit(r);
      });
      on("ROCKET_SCORE", (r) => {
        this.handle_rocket_score(r);
      });
      on("ROCKET_BAD_HIT", (b, r) => {
        this.handle_rocket_bad_hit(b, r);
      });
    }
    handle_rocket_bad_hit(b, r) {
      for (let i = 0; i < 16; i++) {
        this.explosion_pool.get({
          x: b.x + randInt(-5, 5),
          y: b.y + randInt(0, 16),
          dx: randInt(-20, 20),
          dy: randInt(20, 40),
          color: "#Ffffee",
          width: 4,
          height: 4,
          ttl: 10 + randInt(30)
        });
      }
      zzfx(...[, , 979, 0.02, 0.24, 0.48, 3, 1.18, -0.1, , 50, , , 0.6, , 0.9, 0.01, 0.44, 0.18]);
      b.bstate = WAITING;
      b.x = this.canvas.width + 100;
      b.y = randInt(0, this.canvas.height);
      this.parent.score += 2;
      this.parent.kscore.text = this.parent.score;
    }
    handle_rocket_score(r) {
      zzfx(...[1.45, , 88, , 0.08, 0.15, , 0.72, , 6.8, -503, 0.16, , , 36, , 0.01, 0.99]);
      this.parent.score -= 5;
      this.parent.kscore.text = this.parent.score;
    }
    handle_rocket_hit(r) {
      zzfx(...[1.13, , 242, , 0.01, 0.09, 1, , , -0.5, , , , , 162, 0.5, , 0.72, 0.09]);
      r.dx *= -1;
      this.parent.score++;
      this.parent.kscore.text = this.parent.score;
    }
    handle_going(b) {
      b.bstate = GOING;
      b.targetx = this.canvas.width + 100, b.targety = randInt(0, this.canvas.height);
    }
    handle_fire1(b) {
      let r = this._create_rocket();
      r.x = b.x - 32;
      r.y = b.y;
      r.ttl = Infinity;
      r._id = b._id;
      let choice = randInt(1, 10);
      if (choice < 5) {
        r.dx = _BadFac.ROCKET_SPEED_SLOW;
      } else {
        r.dx = _BadFac.ROCKET_SPEED_FAST;
      }
      let ang = angleToTarget(b, this.parent.player);
    }
    take_step(b, dt) {
      let step = dt * lerp(b.y, b.targety, b.lpercent);
      b.lpercent += 0.01;
      if (b.lpercent > 1) {
        if (b.bstate == COMING) {
          b.bstate = FIRING;
        } else if (b.bstate == GOING) {
          b.bstate = WAITING;
        } else {
          console.log("ERROR! state was not COMING");
        }
        return;
      }
      if (b.targety > b.y) {
        b.y += step;
      } else {
        b.y -= step;
      }
      if (b.targetx > b.x) {
        b.x += step;
      } else {
        b.x -= step;
      }
    }
    _handle_waiting_state(b, dt) {
      if (Math.random() < 0.3) {
        this.throwing++;
        b.bstate = COMING;
        b.targety = randInt(0, this.canvas.height - 48);
        b.targetx = this.canvas.width - 96;
        b.lpercent = 0;
      }
    }
    _handle_coming_state(b, dt) {
      this.take_step(b, dt);
    }
    _hande_firing_state(b, dt) {
      emit("FIRE1", b);
      b.bstate = INPLACE_IDLE;
    }
    _handle_going_state(b, dt) {
      this.take_step(b, dt);
    }
    _handle_inplace_idle(b, dt) {
    }
    handle_state_machine_bad(b, dt) {
      if (b.bstate == WAITING) {
        this._handle_waiting_state(b, dt);
        return;
      }
      if (b.bstate == COMING) {
        this._handle_coming_state(b, dt);
        return;
      }
      if (b.bstate == FIRING) {
        this._hande_firing_state(b, dt);
        return;
      }
      if (b.bstate == GOING) {
        this._handle_going_state(b, dt);
        return;
      }
      if (b.bstate == INPLACE_IDLE) {
        this._handle_inplace_idle(b, dt);
        return;
      }
    }
    update(dt) {
      for (let i = 0; i < _BadFac.BAD_COUNT; i++) {
        let b = this.bads[i];
        this.handle_state_machine_bad(b, dt);
        b.update(dt);
        for (let i2 = 0; i2 < this.rockets.objects.length; i2++) {
          let r = this.rockets.objects[i2];
          if (collides(b, r)) {
            emit("ROCKET_BAD_HIT", b, r);
          }
        }
      }
      this.rockets.update(dt);
      this.explosion_pool.update(dt);
      for (let i = 0; i < this.rockets.objects.length; i++) {
        let r = this.rockets.objects[i];
        if (collides(r, this.parent.player)) {
          emit("ROCKET_HIT", r);
          return;
        }
        ;
        if (collides(r, this.parent.goal)) {
          emit("ROCKET_SCORE", r);
          return;
        }
        if (r.ttl == Infinity) {
          if (r.x < 0 || r.x > this.canvas.width) {
            r.ttl = 0;
            if (this.bads[r._id].bstate == INPLACE_IDLE) {
              let b = this.bads[r._id];
              b.bstate = GOING;
              let mid = 300;
              b.targety = randInt(mid - 200, mid + 200);
              b.targetx = this.canvas.width + 100;
              b.lpercent = 0;
              emit("GOING", this.bads[r._id]);
            }
          }
        }
      }
    }
    render() {
      for (let i = 0; i < _BadFac.BAD_COUNT; i++) {
        this.bads[i].render();
      }
      this.rockets.render();
      this.explosion_pool.render();
    }
  };
  var BadFac = _BadFac;
  __publicField(BadFac, "ROCKET_SPEED_SLOW", -250);
  __publicField(BadFac, "ROCKET_SPEED_FAST", -350);
  __publicField(BadFac, "BAD_COUNT", 3);

  // gamescene3.js
  function make_canvas(ctype) {
    let f = document.createElement("canvas");
    f.width = 800;
    f.height = 600;
    let ctx = f.getContext("2d");
    let count = 1e3;
    if (ctype == "close") {
      count = 100;
    }
    for (let i = 0; i < count; i++) {
      let x = randInt(0, 800);
      let y = randInt(0, 600);
      let r = randInt(1, 4);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      if (ctype == "close") {
        ctx.fillStyle = "white";
      } else if (ctype == "far") {
        ctx.fillStyle = "gray";
      } else {
        ctx.fillStyle = "gray";
      }
      ctx.fill();
      ctx.stroke();
    }
    return f;
  }
  var GameScene3 = class {
    constructor(canvas, context2) {
      this.canvas = canvas;
      this.context = context2;
      this.player = factory$8({
        x: this.canvas.width / 6,
        y: this.canvas.height / 2,
        anchor: { x: 0.5, y: 0.5 },
        image: imageAssets["death_v1.png"]
      });
      this.player_trail = factory$4({
        create: factory$8,
        maxSize: 64
      });
      this.score = 0;
      this.kscore = factory$7({
        text: "0",
        font: "32px Arial",
        color: "white",
        x: 32,
        y: 16,
        anchor: { x: 0.5, y: 0.5 },
        textAlign: "center"
      });
      this.goal = factory$8({
        x: this.canvas.width / 14,
        y: this.canvas.height / 2,
        anchor: { x: 0.5, y: 0.5 },
        width: 16,
        height: 400,
        color: "#f00"
      });
      this.bg1 = factory$8({
        x: 0,
        y: 0,
        image: make_canvas("far"),
        dx: -50
      });
      this.bg2 = factory$8({
        x: 800,
        y: 0,
        image: make_canvas("far"),
        dx: -50
      });
      this.bg3 = factory$8({
        x: 800,
        y: 0,
        image: make_canvas("close"),
        dx: -60
      });
      this.score_bar = factory$8({
        x: 48,
        y: 550,
        width: this.canvas.width,
        height: 32,
        color: "green",
        current_score: 0,
        render() {
          this.context.fillStyle = this.color;
          this.context.fillRect(
            0,
            0,
            this.current_score,
            this.height
          );
        }
      });
      this.bf = new BadFac(this, canvas, context2);
    }
    update(dt) {
      if (this.bg1.x < -800) {
        this.bg1.x = 800;
      }
      if (this.bg2.x < -800) {
        this.bg2.x = 800;
      }
      if (this.bg3.x < -800) {
        this.bg3.x = 800;
      }
      this.bg1.update(dt);
      this.bg2.update(dt);
      this.bg3.update(dt);
      if (this.score < 0) {
        this.score_bar.current_score = -1 * this.score;
      }
      this.score_bar.update(dt);
      this.goal.update(dt);
      if (keyPressed("space")) {
        this.player.velocity.y += -500 * dt;
        this.player_trail.get({
          x: this.player.x + randInt(-5, 5),
          y: this.player.y + 16,
          dx: randInt(-20, 20),
          dy: randInt(20, 40),
          color: "#FDDA0D",
          width: 4,
          height: 4,
          ttl: 10 + randInt(30)
        });
      } else {
        this.player.velocity.y += 400 * dt;
      }
      if (this.player.y > this.canvas.height - 32) {
        this.player.y = this.canvas.height - 32;
        this.player.velocity.y = 0;
      }
      if (this.player.y < 0) {
        this.player.y = 0;
        this.player.velocity.y = 0;
      }
      this.player.update(dt);
      this.player_trail.update(dt);
      this.bf.update(dt);
      this.kscore.update();
    }
    render() {
      this.bg1.render();
      this.bg2.render();
      this.bg3.render();
      this.score_bar.render();
      this.goal.render();
      this.player.render();
      this.player_trail.render();
      this.bf.render();
      this.kscore.render();
    }
  };

  // title_scene.js
  var TitleScene = class {
    constructor(canvas, context2) {
      this.canvas = canvas;
      this.context = context2;
      this.title_text = "death grows a garden... on a jetpack";
      this.txt = factory$7({
        text: this.title_text,
        x: 400,
        y: 300,
        font: "32px Arial",
        color: "white",
        anchor: { x: 0.5, y: 0.5 },
        textAlign: "center"
      });
      this.counter = 0;
    }
    update() {
      this.txt.update();
      this.counter++;
      if (this.counter > 120) {
        emit("TITLE_FINISHED");
      }
    }
    render() {
      this.txt.render();
    }
  };

  // menu_scene.js
  var MenuScene = class {
    constructor(canvas, context2) {
      this.canvas = canvas;
      this.context = context2;
      this.title_text = "stop the bad guys from throwing souls\ninto the portal...\nif your bar fills up...\nyou are done for...";
      this.txt = factory$7({
        text: this.title_text,
        x: 400,
        y: 300,
        font: "32px Arial",
        color: "white",
        anchor: { x: 0.5, y: 0.5 },
        textAlign: "center"
      });
      this.counter = 0;
    }
    update() {
      this.txt.update();
      this.counter++;
      if (this.counter > 120) {
        emit("MENU_FINISHED");
      }
    }
    render() {
      this.txt.render();
    }
  };

  // main.js
  function gamemain() {
    let { canvas, context: context2 } = init$1();
    initInput();
    initPointer();
    let sm = new SceneManager();
    let ts = new TitleScene(canvas, context2);
    sm.add("title", ts);
    let ms = new MenuScene(canvas, context2);
    sm.add("menu", ms);
    let gs3 = new GameScene3(canvas, context2);
    sm.add("game3", gs3);
    sm.set("title");
    on("TITLE_FINISHED", () => {
      sm.set("menu");
    });
    on("MENU_FINISHED", () => {
      sm.set("game3");
    });
    let loop = GameLoop({
      update: (dt) => {
        sm._dt = dt;
        sm.update(dt);
      },
      render: () => {
        sm.render();
      }
    });
    loop.start();
  }
  on("main", gamemain);
  function main() {
    load(
      "death_v1.png",
      "angel.png"
    ).then(() => {
      emit("main");
    });
  }
  window.onload = main;
})();
