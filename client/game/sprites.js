
const required = [
  "main_bg.png",
  "cinema_bg.png",
  "beam_fg.png",
  "characters/default.png",
];

export const sprites = {};

class Sprite {
  texture = new Image();
  loaded = false;
  name;
  
  constructor(src) {
    this.texture.addEventListener("load", this.onLoad);
    this.texture.src = "static/images/" + src;
    this.name = src.split(".")[0];
  }
  
  onLoad = () => {
    this.loaded = true;
  };
  
  draw(ctx, x, y, scale = 1) {
    if(!this.loaded) return console.warn("Tried to load");
    ctx.drawImage(this.texture, x - this.texture.width / 2 * scale, y - this.texture.height / 2 * scale, this.texture.width * scale, this.texture.height * scale);
  }
}

export function loadRequiredSprites(callback) {
  let loading = [];
  
  for(const req of required) {
    const name = req.split(".")[0];
    if(!sprites[name]) sprites[name] = new Sprite(req);
    if(!sprites[name].loaded) loading.push(new Promise(res => sprites[name].texture.addEventListener("load", res)));
  }
  
  if(callback) Promise.all(loading).then(callback);
}

export function loadSprite(path) {
  const name = path.split(".")[0];
  if(!sprites[name]) sprites[name] = new Sprite(path);
  return sprites[name];
}


