import Entity from "./entity";
import { Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";

export default class Particle extends Entity {
  drawable; lifetime; acc;
  physics = PHYSICS_TYPE.KINEMATIC;
  created = Date.now();
  
  constructor(drawable, pos, vel = new Vector(), lifetime = 3, acc = new Vector()) {
    super();
    this.drawable = drawable;
    this.pos = pos;
    this.vel = vel;
    this.lifetime = lifetime;
    this.acc = acc;
  }
  
  onDraw(ctx, deltaTime) {
    this.vel = this.vel.add(this.acc.mul(deltaTime));
    
    const { x, y } = this.room.localToCanvas(this.pos);
    ctx.globalAlpha = Math.max(0, Math.min(1, 4 - (Date.now() - this.created) / 1000 / this.lifetime * 4));
    this.drawable.draw(ctx, x, y);
    ctx.globalAlpha = 1;
  }
}
