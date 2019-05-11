import Entity from "../entity";
import { Vector } from "../../math";
import { PHYSICS_TYPE } from "../../physics";

export default class Zone extends Entity {
  static type = Entity.registerType("Zone", this);
  sprite;
  physics = PHYSICS_TYPE.NONE;
  
  constructor(pos, size) {
    super();
    this.pos = pos;
    this.size = size;
  }
  
  static deserialize(entityState) {
    return new this(new Vector(entityState.pos), new Vector(entityState.extra.size));
  }
  
  getExtraState() {
    return {
      size: this.size,
    }
  }
  
  sample() {
    return this.pos.add(this.size.mul(Vector.random(-0.5, 0.5)));
  }
  
  contains(entity) {
    const hs = this.size.mul(0.5);
    return entity.pos.between(this.pos.sub(hs), this.pos.add(hs));
  }
}
