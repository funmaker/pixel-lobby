import uuid from "uuid/v4";
import game from "./game";
import { entityTypes as types } from "../../shared/packets";
import { simulatePhysics } from "../../shared/physics";
import { Vector } from "../../shared/math";
export { types };

export default class Entity {
  id = uuid();
  pos = new Vector();
  vel = new Vector();
  
  type = types.UNKNOWN;
  dirty = false;
  
  constructor(pos) {
    this.pos = pos;
  }
  
  remove() {
    game.removeEntity(this);
  }
  
  onTick(deltaTime) {
    simulatePhysics(this, deltaTime)
  }
  
  getExtraState() {
    return null;
  }
  
  getExtraStateUpdate() {
    return null;
  }
}
