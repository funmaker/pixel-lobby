import { simulatePhysics } from "../../shared/physics";
import { SmoothVector, Vector } from "../../shared/math";

export default class Entity {
  id; type;
  pos = new Vector();
  vel = new Vector();
  smoothPos = new SmoothVector(0, 0,0, 0.1);
  
  constructor(createEntity) {
    this.id = createEntity.id;
    this.pos.set(createEntity.pos);
    this.vel.set(createEntity.vel);
    this.smoothPos.set(this.pos);
  }
  
  update(updateEntity) {
    this.pos.set(updateEntity.pos);
    this.vel.set(updateEntity.vel);
    this.smoothPos.setTarget(updateEntity.pos);
  }
  
  onTick(deltaTime) {
    simulatePhysics(this, deltaTime);
    this.smoothPos.setTarget(this.pos);
  }
  
  onDraw(ctx, deltaTime) {
    this.smoothPos.update(deltaTime);
  }
  
  screenPos() {
    return {
      x: this.smoothPos.x,
      y: 137.5 - 35 - this.smoothPos.z + this.smoothPos.y / 2,
    }
  }
}
