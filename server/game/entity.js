import uuid from "uuid/v4";
import game from "./game";
import { entityTypes as types } from "../../packets";
import { simulatePhysics } from "../../physics";
export { types };

export default class Entity {
  id = uuid();
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  type = types.UNKNOWN;
  dirty = false;
  
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
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
