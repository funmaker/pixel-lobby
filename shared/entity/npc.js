import Entity from "./entity";
import { Vector } from "../math";
import Particle from "./particle";

const MASTERS = {
  furret: "Luksor",
  Miku: "Fun",
};

export default class Npc extends Entity {
  static type = Entity.registerType("Npc", this);
  size = new Vector(60, 10, 96);
  alone = 0;
  name; sprite; tasks;
  
  constructor(name, pos) {
    super();
    this.name = name;
    this.pos = pos;
    this.master = MASTERS[this.name];
    
    if(SERVER) {
      this.tasks = [Npc.iddleTask()];
      this.setInterval(this.onThink, 500);
    } else {
      this.sprite = GAME.sprites.get(`npc/${name}.png`);
      window.addEventListener("click", this.onClick);
    }
  }
  
  static deserialize(entityState) {
    return new Npc(entityState.extra.name, entityState.pos);
  }
  
  getExtraState() {
    return {
      name: this.name,
    }
  }
  
  onRemove() {
    window.removeEventListener("click", this.onClick);
  }
  
  onUpdate(update) {
    super.onUpdate(update);
    
    if(update.extra.happy && this.name === "Miku") {
      for(let i = 0; i < 5; i++) {
        const ang = Math.random() * Math.PI * 2;
        const heart = new Particle(
          GAME.sprites.get(`particles/heart${Math.random() < 0.5 ? 1 : 2}`),
          this.pos.add(new Vector(Math.sin(ang) * 30, Math.cos(ang) * 15, 28)),
          new Vector(Math.sin(ang) * 5, Math.cos(ang) * 2.5, 15),
          1
        );
        this.room.addEntity(heart);
      }
    }
  }
  
  onDraw(ctx, deltaTime) {
    super.onDraw(ctx, deltaTime);
    
    let { x, y } = this.room.localToCanvas(this.smoothPos.sub(new Vector(0, 0, this.size.z / 2)));
    const sitting = this.room.findEntities("SitZone").some(zone => zone.contains(this));
    if(sitting) y += 20;
    
    ctx.save();
    ctx.translate( x, y );
    if(sitting) ctx.scale(-1, 1);
    if(this.vel.magnitude() && this.pos.z <= this.size.z / 2) ctx.rotate(Math.sin(Date.now() / 50) * 0.1);
    ctx.translate( 0, -this.sprite.texture.height / 2);
    this.sprite.draw(ctx, 0, 0);
    ctx.restore();
  }
  
  onTick(deltaTime) {
    super.onTick(deltaTime);
    if(!SERVER) return;
    
    let speed = 100;
    const task = this.tasks[this.tasks.length - 1];
  
    switch(task.type) {
      case "GOTO": {
        let dist = task.target.sub(this.pos);
        dist.z = 0;
        if(dist.magnitude() < 10) {
          this.tasks.pop();
          this.vel.x = 0;
          this.vel.y = 0;
          return
        }
  
        dist = dist.normalized().mul(speed);
        this.vel.x = dist.x;
        this.vel.y = dist.y;
  
        if(Math.random() < 0.1 * deltaTime && this.pos.z === this.size.z / 2) {
          this.vel.z = 300;
        }
        this.dirty = true;
        break;
      }
      
      case "FOLLOW": {
        let target;
        if(task.entity.pos.x > this.pos.x) {
          target = task.entity.pos.add(new Vector(-34, 2, 0));
        } else {
          target = task.entity.pos.add(new Vector(34, 2, 0));
        }
        let dist = target.sub(this.pos);
        dist.z = 0;
        if(dist.magnitude2() > 1) {
          dist = dist.div(dist.magnitude());
          dist = dist.mul(speed);
          this.vel.x = dist.x;
          this.vel.y = dist.y;
          this.dirty = true;
        } else {
          if(this.vel.x !== 0 || this.vel.y !== 0) this.dirty = true;
          this.vel.x = 0;
          this.vel.y = 0;
        }
        break;
      }
    }
  }
  
  onThink = () => {
    const task = this.tasks[this.tasks.length - 1];
    
    switch(task.type) {
      case "IDDLE":
        if(Math.random() < 0.1) {
          this.tasks.push(Npc.gotoTask(Vector.random(this.pos.sub(200).clamp(new Vector(), this.room.size),
                                                     this.pos.add(200)).clamp(new Vector(), this.room.size)));
        }
        break;
        
      case "GOTO":
        if(Date.now() - task.started > 5000) this.tasks.pop();
        break;
        
      case "FOLLOW":
        if(task.entity.removed) return this.tasks.pop();
        if(task.entity.pos.sub(this.pos).magnitude() > 40) {
          this.alone++;
        } else if(this.alone > 0) {
          this.alone = 0;
          this.extraStateUpdate.happy = true;
          this.dirty = true;
        }
        break;
    }
  };
  
  onClick = ev => {
    if(this.mouseHover(ev.clientX, ev.clientY)) {
      this.interact();
    }
  };
  
  onInteract(player, data) {
    const task = this.tasks[this.tasks.length - 1];
    if(task.type === "IDDLE") {
      if(player.pos.sub(this.pos).magnitude() > 100) {
        this.tasks.push(Npc.gotoTask(this.pos.sub(player.pos).normalized().mul(80).add(player.pos)));
      } else if(player.name === this.master) {
        this.tasks.push(Npc.followTask(player));
      }
    } else if(task.type === "FOLLOW" && player.name === this.master) {
      this.tasks.pop();
    }
  }
  
  static iddleTask = () => ({ type: "IDDLE" });
  static gotoTask = (target) => ({ type: "GOTO", target, started: Date.now() });
  static followTask = (entity) => ({ type: "FOLLOW", entity });
}
