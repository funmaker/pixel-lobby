import { Drawable } from "./drawable";

export class Sprite extends Drawable {
  texture = new Image();
  loaded = false;
  name;
  
  constructor(src) {
    super(0, 0);
    this.texture.addEventListener("load", this.onLoad);
    this.texture.src = "static/images/" + src;
    this.name = src.split(".")[0];
  }
  
  onLoad = () => {
    this.loaded = true;
    this.width = this.texture.width;
    this.height = this.texture.height;
  };
  
  draw(ctx, x, y, scale = 1) {
    ctx.drawImage(this.loaded ? this.texture : this.constructor.fallbackTexture, x - this.width / 2 * scale, y - this.height / 2 * scale, this.width * scale, this.height * scale);
  }
}

export default class SpritesManager {
  baseLoaded = false;
  base = [
    "main_bg.png",
    "cinema_bg.png",
    "cinema_fg.png",
    "beam_fg.png",
    "characters/default.png",
    "particles/heart1.png",
    "particles/heart2.png",
  ];
  sprites = {};
  
  async loadBaseSprites() {
    let loading = [];
  
    for(const req of this.base) {
      const name = req.split(".")[0];
      if(!this.sprites[name]) this.sprites[name] = new Sprite(req);
      if(!this.sprites[name].loaded) loading.push(new Promise(res => this.sprites[name].texture.addEventListener("load", res)));
    }
  
    await Promise.all(loading);
    this.baseLoaded = true;
  }
  
  get(name) {
    if(!this.sprites[name]) return this.sprites[name] = new Sprite(name);
    else return this.sprites[name];
  }
}
