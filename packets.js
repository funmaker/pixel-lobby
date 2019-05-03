
export const types = {
  JOIN: "JOIN",
  LEAVE: "LEAVE",
  STATE: "STATE",
  CREATE_ENTITY: "CREATE_ENTITY",
  REMOVE_ENTITY: "REMOVE_ENTITY",
  UPDATE: "UPDATE",
  CHAT: "CHAT",
  MOVE: "MOVE",
};

export const entityTypes = {
  UNKNOWN: "UNKNOWN",
  PLAYER: "PLAYER",
};

export const join = (name) => JSON.stringify({
  type: types.JOIN,
  name,
});

export const leave = () => JSON.stringify({
  type: types.LEAVE,
});

const entityState = (entity) => ({
  id: entity.id, entityType: entity.type,
  x: entity.x, y: entity.y, z: entity.z,
  vx: entity.vx, vy: entity.vy, vz: entity.vz,
  extra: entity.getExtraState(),
});

export const state = (game) => JSON.stringify({
  type: types.STATE,
  entities: [...game.entities.values()].map(createEntity).map(entityState),
});

export const createEntity = (entity) => JSON.stringify({
  type: types.CREATE_ENTITY,
  ...entityState(entity),
});

export const removeEntity = (entity) => JSON.stringify({
  type: types.REMOVE_ENTITY,
  id: entity.id,
});

const updateEntity = (entity) => ({
  id: entity.id,
  x: entity.x, y: entity.y, z: entity.z,
  vx: entity.vx, vy: entity.vy, vz: entity.vz,
  extra: entity.getExtraStateUpdate(),
});

export const update = (game) => JSON.stringify({
  type: types.UPDATE,
  entities: [...game.entities.values()].filter(entity => entity.dirty).map(updateEntity),
});

export const chat = (text, user) => JSON.stringify({
  type: types.STATE,
  text, user,
});

export const move = (key, pressed) => JSON.stringify({
  type: types.MOVE,
  key, pressed,
});
