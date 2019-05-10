

export const GRAVITY = 600;
export const FRICTION = 0.98;

export const PHYSICS_TYPE = {
  NORMAL: "NORMAL",
  NONE: "NONE",
  KINEMATIC: "KINEMATIC",
};

export function simulatePhysics(room, deltaTime) {
  for(const entity of room.entities.values()) {
    if(entity.physics === PHYSICS_TYPE.NONE) continue;
  
    entity.pos = entity.pos.add(entity.vel.mul(deltaTime));
    if(entity.physics !== PHYSICS_TYPE.KINEMATIC) entity.vel = entity.vel.mul(FRICTION);
    
    for(const d of ["x", "y", "z"]) {
      if(entity.pos[d] < entity.size[d] / 2) {
        entity.pos[d] = entity.size[d] / 2;
        entity.vel[d] = 0;
      } else if(entity.pos[d] > room.size[d] - entity.size[d] / 2) {
        entity.pos[d] = room.size[d] - entity.size[d] / 2;
        entity.vel[d] = 0;
      }
    }
  
    if(entity.physics !== PHYSICS_TYPE.KINEMATIC) {
      if(entity.pos.z > entity.size.z / 2) {
        entity.vel.z -= GRAVITY * deltaTime;
      }
    }
  }
}
