
export function simulatePhysics(entity, deltaTime) {
  entity.x += entity.vx * deltaTime;
  entity.y += entity.vy * deltaTime;
  entity.z += entity.vz * deltaTime;
  entity.vx *= 0.98;
  entity.vy *= 0.98;
  entity.vz *= 0.98;
  
  if(entity.y < -70) {
    entity.y = -70;
    entity.vy = 0;
  } else if(entity.y > 70) {
    entity.y = 70;
    entity.vy = 0;
  }
  
  if(entity.z < 0) {
    entity.z = 0;
    entity.vz = 0;
  } else if(entity.z > 0) {
    entity.vz -= 30;
  }
}
