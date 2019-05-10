import BSON from "bson";

// Network entities
import "./entity/entity";
import "./entity/player";
import "./entity/staticImage";
import "./entity/board";
import "./entity/youtube";
import "./entity/button";

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

export const join = (name) => BSON.serialize({
  type: types.JOIN,
  name,
});

export const leave = () => BSON.serialize({
  type: types.LEAVE,
});

export const state = (room, player) => BSON.serialize({
  type: types.STATE,
  ...room.serialize(),
  localPlayer: player.id,
});

export const createEntity = (entity) => BSON.serialize({
  type: types.CREATE_ENTITY,
  ...entity.serialize(),
});

export const removeEntity = (entity) => BSON.serialize({
  type: types.REMOVE_ENTITY,
  id: entity.id,
});

export const update = (room) => BSON.serialize({
  type: types.UPDATE,
  ...room.getUpdate(),
});

export const chat = (text, user) => BSON.serialize({
  type: types.CHAT,
  text, user,
});

export const move = (key, pressed) => BSON.serialize({
  type: types.MOVE,
  key, pressed,
});

export const line = (id, x1, y1, x2, y2, width, clear) => BSON.serialize({
  type: types.LINE,
  id, x1, y1, x2, y2, width, clear
});
