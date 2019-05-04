import fs from "fs-extra";
import path from "path";
import Entity, { types } from "./entity";
import { Vector } from "../../shared/math";

const defaultSprites = [
  "anonymous",
  "borat",
  "hitler",
  "kkk",
  "bambo",
  "papaj",
  "exhibitionist",
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
    super(new Vector(Math.random() * 70 - 35, Math.random() * 70 - 35, 0));
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
  
    this.vel.x = (this.keys.right - this.keys.left) * speed;
    this.vel.y = (this.keys.down - this.keys.up) * speed;
    
    if(this.keys.jump && this.pos.z === 0) {
      this.vel.z = 300;
      this.dirty = true;
    }
    
    if(this.vel.x || this.vel.y || this.vel.z || this.dirtyKeys) this.dirty = true;
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
