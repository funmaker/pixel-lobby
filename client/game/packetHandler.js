import * as packets from "../../shared/packets";
import Room from "../../shared/room";
import Entity from "../../shared/entity/entity";
import { ChatBubble } from "./drawable";
import Particle from "../../shared/entity/particle";
import { Vector } from "../../shared/math";

export function handlePacket(data) {
  if(data.type !== packets.types.UPDATE) console.log(data);
  
  switch(data.type) {
    case packets.types.STATE:
      state(data);
      break;
    
    case packets.types.CREATE_ENTITY:
      createEntity(data);
      break;
    
    case packets.types.REMOVE_ENTITY:
      removeEntity(data);
      break;
    
    case packets.types.UPDATE:
      GAME.room.onUpdate(data);
      break;
    
    case packets.types.CHAT:
      chat(data);
      break;
    
    default:
      console.error(`Unknown packet type: ${data.type}`)
  }
}

function state(data) {
  if(GAME.room) GAME.room.entities.forEach(entity => entity.remove());
  
  const room = Room.deserialize(data);
  const player = room.entities.get(data.localPlayer);
  GAME.changeRoom(room, player);
}

function createEntity(data) {
  GAME.room.addEntity(Entity.deserialize(data));
}

function removeEntity(data) {
  if(GAME.localPlayer && data.id === GAME.localPlayer.id) GAME.changeRoom(GAME.room, null);
  GAME.room.removeEntity(data.id);
}

function chat(data) {
  const player = [...GAME.room.entities.values()].find(player => player.id === data.id) || GAME.localPlayer;
  if(!player) return;
  
  const bubble = new Particle(new ChatBubble(data.text, GAME.render.ctx), player.pos, new Vector(0, 0, 15), 2);
  bubble.pos = bubble.pos.add(new Vector(bubble.drawable.width / 2 + 20, 1, 32));
  player.room.addEntity(bubble);
}
