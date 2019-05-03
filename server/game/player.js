import fs from "fs-extra";
import path from "path";
import Entity, { types } from "./entity";

const defaultSprites = [
  "anonymous",
  "borat",
  "hitler",
];

export default class Player extends Entity {
  name;
  ws;
  sprite = "default";
  type = types.PLAYER;
  extraUpdate = {};
  keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
  };
  
  constructor(name, ws) {
    super(Math.random() * 70 - 35, Math.random() * 70 - 35, 0);
    this.x = this.y = this.z = 0;
    this.name = name;
    this.ws = ws;
    
    ws.on("close", () => {
      this.remove();
    });
    
    this.determineSprite();
  }
  
  async determineSprite() {
    const pathname = path.join("./static/images/characters/", path.normalize(`${this.name}.png`).replace(/^(\.\.(\/|\\|$))+/, ''));
    
    if(await fs.pathExists(pathname)) {
      this.sprite = this.name;
    } else {
      this.sprite = defaultSprites[Math.floor(Math.random() * defaultSprites.length)];
    }
    this.extraUpdate.sprite = this.sprite;
    this.dirty = true;
  }
  
  move(key, pressed) {
    this.keys[key] = pressed;
    this.dirtyKeys = true;
  }
  
  onTick(deltaTime) {
    let speed = 100;
    
    if(this.sprite === "sanic") speed *= 5;
    
    this.vy = (this.keys.down - this.keys.up) * speed;
    this.vx = (this.keys.right - this.keys.left) * speed;
    
    if(this.keys.jump && this.z === 0) {
      this.vz = 300;
      this.dirty = true;
    }
    
    if(this.vx || this.vy || this.vz || this.dirtyKeys) this.dirty = true;
    this.dirtyKeys = false;
    
    super.onTick(deltaTime);
  }
  
  getExtraState() {
    return {
      name: this.name,
      sprite: this.sprite,
    }
  }
  
  getExtraStateUpdate() {
    const update = this.extraUpdate;
    this.extraUpdate = {};
    return update;
  }
}
