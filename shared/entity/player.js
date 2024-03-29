import { Vector } from "../math";
import Entity from "./entity";
import * as packets from "../packets";
import Particle from "./particle";

const KEYS = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
  jump: "Space",
};

export default class Player extends Entity {
  static type = Entity.registerType("Player", this);
  user;
  name;
  size = new Vector(60, 10, 96);
  sprite = CLIENT ? GAME.sprites.get("characters/default") : "default";
  boardTool = null;
  happy = false;
  keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
  };
  
  constructor(name, user) {
    super();
    this.name = name;
    this.user = user;
    
    if(CLIENT) {
      if(name === "Rivuhh") {
        const interval = setInterval(() => {
          if(!this.room) return clearInterval(interval);
      
          const ang = Math.random() * Math.PI * 2;
          const heart = new Particle(GAME.sprites.get(`particles/heart${Math.random() < 0.5 ? 1 : 2}`), this.pos, new Vector(0, 0, 20), 0.75);
          heart.pos = heart.pos.add(new Vector(Math.sin(ang) * 30, Math.cos(ang) * 15, 28));
          this.room.addEntity(heart);
        }, 100)
      }
      if(this.name === "Natalie" || this.name === "Natalie2") {
        const interval = setInterval(() => {
          console.log(!this.room, this.happy);
          if(!this.room) return clearInterval(interval);
          if(!this.happy) return;
          
          const ang = Math.random() * Math.PI * 2;
          const heart = new Particle(GAME.sprites.get(`particles/heart${Math.random() < 0.5 ? 1 : 2}`), this.pos, new Vector(0, 0, 20), 0.75);
          heart.pos = heart.pos.add(new Vector(Math.sin(ang) * 30, Math.cos(ang) * 15, 28));
          this.room.addEntity(heart);
        }, 100)
      }
    }
  }
  
  static deserialize(entityState) {
    const player = new Player(entityState.extra.name);
    player.sprite = GAME.sprites.get(`characters/${entityState.extra.sprite}.png`);
    player.keys = entityState.extra.keys;
    return player;
  }
  
  getExtraState() {
    return {
      name: this.name,
      sprite: this.sprite,
      keys: this.keys,
    }
  }
  
  onUpdate(update) {
    super.onUpdate(update);
    
    if(update.extra.name) this.name = update.extra.name;
    if(update.extra.sprite) this.changeSprite(update.extra.sprite);
    if(update.extra.keys) this.keys = update.extra.keys;
    
    if(this.name === "Natalie" || this.name === "Natalie2") {
      this.happy = false;
      for(const entity of GAME.room.entities.values()) {
        if(!(entity instanceof Player) || entity.name !== "Fun") continue;
        if(entity.pos.sub(this.pos).magnitude() < 100) this.happy = true;
        break;
      }
    }
  }
  
  onTick(deltaTime) {
    let speed = 200;
    
    if(this.sprite === "sanic") speed *= 3;
    
    this.vel.x = (this.keys.right - this.keys.left) * speed;
    this.vel.y = (this.keys.up - this.keys.down) * speed;
    
    if(this.keys.jump && this.pos.z === this.size.z / 2) {
      this.vel.z = 300;
      this.dirty = true;
    }
    
    super.onTick(deltaTime);
  }
  
  onDraw(ctx, deltaTime) {
    super.onDraw(ctx, deltaTime);
    
    let { x, y } = this.room.localToCanvas(this.smoothPos.sub(new Vector(0, 0, this.size.z / 2)));
    const sprite = this.sprite.loaded ? this.sprite : GAME.sprites.get("characters/default");
    const sitting = this.room.findEntities("SitZone").some(zone => zone.contains(this));
    if(sitting) y += 20;
    
    ctx.save();
    ctx.translate( x, y );
    if(sitting) ctx.scale(-1, 1);
    if(this.name === "sanic") {
      if(this.vel.magnitude() && this.pos.z <= this.size.z / 2){
        ctx.rotate(Math.sin(Date.now() / 15) * 0.1);
        ctx.translate( 0, -sprite.texture.height / 2);
        sprite.draw(ctx, 0, 0);
      } else if(this.pos.z > this.size.z / 2) {
        ctx.translate( 0, -sprite.texture.height / 2);
        ctx.rotate((Date.now() / 30) % (Math.PI * 2));
        sprite.draw(ctx, 0, 0);
      } else {
        sprite.draw(ctx, 0, -sprite.texture.height / 2);
      }
    } else {
      if(this.vel.magnitude() && this.pos.z <= this.size.z / 2) ctx.rotate(Math.sin(Date.now() / 50) * 0.1);
      ctx.translate( 0, -sprite.texture.height / 2);
      sprite.draw(ctx, 0, 0);
    }
    ctx.restore();
    
    if(sitting) ctx.globalAlpha = 0.1;
    ctx.font = '16px minecraft';
    const measure = ctx.measureText(this.name);
    ctx.fillStyle = "#0007";
    ctx.fillRect(x - measure.width / 2 - 2, y - sprite.texture.height - 25, measure.width + 2, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(this.name, x - measure.width / 2, y - sprite.texture.height - 10);
    if(sitting) ctx.globalAlpha = 1;
  }
  
  takeControl() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }
  
  onRemove() {
    if(CLIENT) {
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
    }
  }
  
  onKeyDown = ev => {
    for(const key in KEYS) {
      if(KEYS[key] === ev.code && !this.keys[key]) this.move(key, true);
    }
  };
  
  onKeyUp = ev => {
    for(const key in KEYS) {
      if(KEYS[key] === ev.code && this.keys[key]) this.move(key, false);
    }
  };
  
  changeSprite(sprite) {
    if(CLIENT) {
      this.sprite = GAME.sprites.get(`characters/${sprite}.png`);
    } else {
      this.extraStateUpdate.sprite = this.sprite = sprite;
      this.dirty = true;
    }
  }
  
  move(key, pressed) {
    this.keys[key] = pressed;
    if(CLIENT) {
      GAME.send(packets.move(key, pressed));
    } else {
      this.extraStateUpdate.keys = this.keys;
      this.dirty = true;
    }
  }
}
