import uuid from "uuid/v4";
import { SmoothVector, Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";

export default class Entity {
  static type = "MissingNo.";
  static types = {
    ["MissingNo."]: this,
  };
  
  static registerType = (name, type) => {
    this.types[name] = type;
    return name;
  };
  
  id = uuid();
  pos = new Vector();
  vel = new Vector();
  size = new Vector();
  physics = PHYSICS_TYPE.NORMAL;
  mass = 1;
  dirty = false;
  smoothPos = new SmoothVector(0, 0,0, 0.1);
  extraStateUpdate = {};
  room = null;
  type = this.constructor.type;
  
  serialize() {
    return {
      id: this.id, entityType: this.constructor.type,
      pos: this.pos, vel: this.vel,
      extra: this.getExtraState(),
    };
  }
  
  static deserialize(entityState) {
    const TypedEntity = this.types[entityState.entityType];
    if(!TypedEntity) throw new Error(`Entity type not found: \`${entityState.entityType}\``);
    
    const entity = TypedEntity.deserialize(entityState);
    entity.id = entityState.id;
    entity.pos = new Vector(entityState.pos);
    entity.smoothPos.set(entity.pos);
    entity.vel = new Vector(entityState.vel);
    return entity;
  }
  
  getUpdate() {
    return {
      id: this.id,
      pos: this.pos, vel: this.vel,
      extra: this.getExtraStateUpdate(),
    }
  }
  
  onUpdate(update) {
    this.pos.set(update.pos);
    this.vel.set(update.vel);
    this.smoothPos.setTarget(update.pos);
  }
  
  onTick(deltaTime) {
    this.smoothPos.setTarget(this.pos);
  }
  
  onDraw(ctx, deltaTime) {
    this.smoothPos.update(deltaTime);
  }
  
  remove() {
    this.room.removeEntity(this.id);
  }
  
  tlbCorner() {
    return this.pos.add(new Vector(-this.size.x / 2, -this.size.y / 2, this.size.z / 2));
  }
  
  mouseHover(x, y) {
    const corner = this.room.localToCanvas(this.tlbCorner());
    const { x: cx, y: cy } = this.room.screenToCanvas(new Vector(x, y)).sub(corner);
    return cx >= 0 && cx < this.size.x && cy >= 0 && cy < this.size.z;
  }
  
  onRemove() {
  
  }
  
  onInteract(data) {
  
  }
  
  getExtraState() {
    return null;
  }
  
  getExtraStateUpdate() {
    const update = this.extraStateUpdate;
    this.extraStateUpdate = {};
    return update;
  }
}
