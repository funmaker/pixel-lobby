import * as packets from "../../shared/packets";
import Player from "./player";
import Entity from "./entity";
import game from "./game";
import { drawLine } from "./board";

export let socket;
export let localPlayerName = null;

export function connect(callback) {
  if(socket) return callback && void callback();
  
  window.socket = socket = new WebSocket(`ws://${location.host}/ws`);
  
  socket.addEventListener("message", event => {
    const data = JSON.parse(event.data);
    
    handlePacket(data);
  });
  
  socket.addEventListener("open", () => {
    console.log("Connected");
    if(callback) callback();
  });
  
  socket.addEventListener("close", event => {
    console.error("Connection closed: ", event.code, event.reason);
    socket = null;
    connect();
  })
}

export function send(packet) {
  socket.send(packet);
}

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
      for(const entityUpdate of data.entities) {
        game.entities.get(entityUpdate.id).update(entityUpdate);
      }
      
      for(const line of data.lines) {
        const {x1, y1, x2, y2, width, clear} = line;
        drawLine(x1, y1, x2, y2, width, clear);
      }
      break;
    
    case packets.types.CHAT:
      console.log(`${data.user}: ${data.text}`);
      break;
    
    default:
      console.error(`Unknown packet type: ${data.type}`)
  }
}

function state(data) {
  game.entities.clear();
  for(const createEntityData of data.entities) {
    createEntity(createEntityData);
  }
  
  if(!localPlayerName) localPlayerName = prompt("Enter user name");
  if(localPlayerName) send(packets.join(localPlayerName));
}

function createEntity(data) {
  switch(data.entityType) {
    case packets.entityTypes.PLAYER: {
      const player = new Player(data);
      game.addEntity(player);
      if(player.name === localPlayerName) game.updateLocalPlayer(player);
      break;
    }
    
    default: {
      game.addEntity(new Entity(data));
    }
  }
}

function removeEntity(data) {
  if(game.localPlayer && data.id === game.localPlayer.id) game.updateLocalPlayer(null);
  game.removeEntity(data.id);
}

