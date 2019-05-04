
export const types = {
  JOIN: "JOIN",
  LEAVE: "LEAVE",
  STATE: "STATE",
  CREATE_ENTITY: "CREATE_ENTITY",
  REMOVE_ENTITY: "REMOVE_ENTITY",
  UPDATE: "UPDATE",
  CHAT: "CHAT",
  MOVE: "MOVE",
  LINE: "LINE",
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
  pos: entity.pos, vel: entity.vel,
  extra: entity.getExtraState(),
});

export const state = (game) => JSON.stringify({
  type: types.STATE,
  entities: [...game.entities.values()].map(entityState),
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
  pos: entity.pos, vel: entity.vel,
  extra: entity.getExtraStateUpdate(),
});

export const update = (game, lines) => JSON.stringify({
  type: types.UPDATE,
  entities: [...game.entities.values()].filter(entity => entity.dirty).map(updateEntity),
  lines,
});

export const chat = (text, user) => JSON.stringify({
  type: types.STATE,
  text, user,
});

export const move = (key, pressed) => JSON.stringify({
  type: types.MOVE,
  key, pressed,
});

export const line = (x1, y1, x2, y2, width, clear) => JSON.stringify({
  type: types.LINE,
  x1, y1, x2, y2, width, clear
});
