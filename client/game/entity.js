import { simulatePhysics } from "../../physics";

class Smooth {
  current;
  target;
  smoothTime;
  maxSpeed;
  currentVelocity = 0;
  
  constructor(value = 0, smoothTime = 1, maxSpeed = Infinity) {
    this.current = this.target = value;
    this.smoothTime = smoothTime;
    this.maxSpeed = maxSpeed;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  set(current) {
    this.target = this.current = current;
  }
  
  update(deltaTime) {
    deltaTime = Math.max(0.0001, deltaTime);
    let num = 2 / this.smoothTime;
    let num2 = num * deltaTime;
    let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
    let num4 = this.current - this.target;
    let num5 = this.target;
    let num6 = this.maxSpeed * this.smoothTime;
    if(num4 < -num6) num4 = -num6;
    if(num4 > num6) num4 = num6;
    this.target = this.current - num4;
    let num7 = (this.currentVelocity + num * num4) * deltaTime;
    this.currentVelocity = (this.currentVelocity - num * num7) * num3;
    let num8 = this.target + (num4 + num7) * num3;
    if(num5 - this.current > 0 === num8 > num5) {
      num8 = num5;
      this.currentVelocity = (num8 - num5) / deltaTime;
    }
    this.current = num8;
  }
}

export default class Entity {
  id; type;
  x; y; z;
  vx; vy; vz;
  sx = new Smooth(0, 0.1);
  sy = new Smooth(0, 0.1);
  sz = new Smooth(0, 0.1);
  
  constructor(createEntity) {
    this.id = createEntity.id;
    this.x = createEntity.x;
    this.y = createEntity.y;
    this.z = createEntity.z;
    this.vx = createEntity.vx;
    this.vy = createEntity.vy;
    this.vz = createEntity.vz;
    this.type = createEntity.type;
    this.sx.set(this.x);
    this.sy.set(this.y);
    this.sz.set(this.z);
  }
  
  update(updateEntity) {
    this.x = updateEntity.x;
    this.y = updateEntity.y;
    this.z = updateEntity.z;
    this.vx = updateEntity.vx;
    this.vy = updateEntity.vy;
    this.vz = updateEntity.vz;
    this.sx.setTarget(this.x);
    this.sy.setTarget(this.y);
    this.sz.setTarget(this.z);
  }
  
  onTick(deltaTime) {
    this.sx.update(deltaTime);
    this.sy.update(deltaTime);
    this.sz.update(deltaTime);
    simulatePhysics(this, deltaTime);
  }
  
  onDraw() {}
  
  screenPos(ctx) {
    return {
      x: this.sx.current,
      y: 137.5 - 35 - this.sz.current + this.sy.current / 2,
    }
  }
}
