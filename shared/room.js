import { Vector } from "./math";
import Entity from "./entity/entity";
import * as packets from "./packets";
import { simulatePhysics } from "./physics";

export default class Room {
  name; size;
  entities = new Map();
  
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
  
  serialize() {
    return {
      size: this.size, name: this.name,
      entities: [...this.entities.values()].map(entity => entity.serialize()),
    };
  }
  
  static deserialize(room) {
    const newRoom = new Room(room.name, new Vector(room.size));
    
    for(const entity of room.entities) {
      newRoom.addEntity(Entity.deserialize(entity));
    }
    
    return newRoom;
  }
  
  close() {
    for(const entity of this.entities.values()) {
      entity.remove();
    }
  }
  
  onTick(deltaTime) {
    for(const entity of this.entities.values()) {
      entity.onTick(deltaTime);
    }
    simulatePhysics(this, deltaTime);
  }
  
  onDraw(ctx, deltaTime) {
    const entities = [...this.entities.values()].sort((a, b) => b.pos.y - a.pos.y);
  
    for(const entity of entities) {
      entity.onDraw(ctx, deltaTime);
    }
  }
  
  getUpdate() {
    return {
      entities: [...this.entities.values()].filter(entity => entity.dirty).map(entity => entity.getUpdate()),
    }
  }
  
  onUpdate(update) {
    for(const entity of update.entities) {
      this.entities.get(entity.id).onUpdate(entity);
    }
  }
  
  addEntity(entity) {
    entity.room = this;
    this.entities.set(entity.id, entity);
    if(SERVER) {
      GAME.sendAll(packets.createEntity(entity), this);
    }
  }
  
  removeEntity(id) {
    const entity = this.entities.get(id);
    if(!entity) return console.warn(`Tried to remove invalid entity: ${id}`);
    
    entity.onRemove();
    this.entities.delete(id);
    entity.room = null;
    
    if(SERVER) {
      GAME.sendAll(packets.removeEntity(entity), this);
    }
  }
  
  findEntity = (type) => [...this.entities.values()].find(entity => entity.type === type);
  findEntities = (type) => [...this.entities.values()].filter(entity => entity.type === type);
  
  localToCanvas = vec => new Vector(vec.x, 275 - vec.z - vec.y / 2);
  canvasToScreen = vec => new Vector((vec.x - GAME.scroll) * GAME.scale + GAME.render.canvas.width / 2, (vec.y - 275) * GAME.scale + GAME.render.canvas.height, 0);
  localToScreen = vec => this.canvasToScreen(this.localToCanvas(vec));
  screenToCanvas = vec => new Vector((vec.x - GAME.render.canvas.width / 2) / GAME.scale + GAME.scroll, 275 + (vec.y - GAME.render.canvas.height) / GAME.scale, 0);
}
