
export const ROOM_X_MIN = -375;
export const ROOM_X_MAX = 887;
export const ROOM_Y_MIN = -70;
export const ROOM_Y_MAX = 70;
export const ROOM_Z_MIN = 0;
export const GRAVITY = 600;
export const FRICTION = 0.98;

export function simulatePhysics(entity, deltaTime) {
  entity.pos = entity.pos.add(entity.vel.mul(deltaTime));
  entity.vel = entity.vel.mul(FRICTION);
  
  if(entity.pos.x < ROOM_X_MIN) {
    entity.pos.x = ROOM_X_MIN;
    entity.vel.x = 0;
  } else if(entity.pos.x > ROOM_X_MAX) {
    entity.pos.x = ROOM_X_MAX;
    entity.vel.x = 0;
  }
  
  if(entity.pos.y < ROOM_Y_MIN) {
    entity.pos.y = ROOM_Y_MIN;
    entity.vel.y = 0;
  } else if(entity.pos.y > ROOM_Y_MAX) {
    entity.pos.y = ROOM_Y_MAX;
    entity.vel.y = 0;
  }
  
  if(entity.pos.z < ROOM_Z_MIN) {
    entity.pos.z = ROOM_Z_MIN;
    entity.vel.z = 0;
  }
  if(entity.pos.z > 0) {
    entity.vel.z -= GRAVITY * deltaTime;
  }
}
