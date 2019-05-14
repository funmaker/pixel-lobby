import uuid from "uuid/v4";
import { SmoothVector, Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";
import * as packets from "../packets";

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
  removed = false;
  type = this.constructor.type;
  timers = { interval: [], timeout: [] };
  
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
    this.timers.timeout.forEach(clearTimeout);
    this.timers.interval.forEach(clearInterval);
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
  
  setTimeout(...args) {
    const timeout = setTimeout(...args);
    this.timers.timeout.push(timeout);
    return timeout;
  }
  
  setInterval(...args) {
    const interval = setInterval(...args);
    this.timers.interval.push(interval);
    return interval;
  }
  
  onRemove() {
  
  }
  
  interact(data) {
    GAME.send(packets.interact(this.id, data));
  }
  
  onInteract(player, data) {
  
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
