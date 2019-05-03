import Player from "./player";
import * as packets from "../../packets";
import { users } from "../routes/index";

export default new class Game {
  entities = new Map();
  players = new Map();
  lastTick = Date.now();
  
  constructor() {
    setInterval(this.onTick, 1000 / 30);
    setInterval(this.onNetwork, 1000 / 10);
  }
  
  onTick = () => {
    const deltaTime = (Date.now() - this.lastTick) / 1000;
    this.lastTick = Date.now();
  
    for(const entity of this.entities.values()) {
      entity.onTick(deltaTime);
    }
  };
  
  onNetwork = () => {
    if([...this.entities.values()].some(entity => entity.dirty)) {
      const update = packets.update(this);
      
      for(const entity of this.entities.values()) {
        entity.dirty = false;
      }
      
      this.sendAll(update);
    }
  };
  
  addEntity(entity) {
    this.entities.set(entity.id, entity);
    this.sendAll(packets.createEntity(entity));
  }
  
  removeEntity(entity) {
    if(this.entities.delete(entity.id)) {
      this.sendAll(packets.removeEntity(entity));
    }
  }
  
  sendAll(packet) {
    users.forEach(user => {
      try {
        user.send(packet)
      } catch(e) {}
    });
  }
  
  handlePacket(ws, data) {
    if(data.type !== packets.types.MOVE) console.log(data);
    const player = this.players.get(ws);
    
    switch(data.type) {
      case packets.types.JOIN: {
        if(player) throw new Error(`User already joined`);
    
        const newPlayer = new Player(data.name, ws);
        this.addEntity(newPlayer);
        this.players.set(ws, newPlayer);
        
        console.log(newPlayer.name + " joined the game");
        break;
      }
      
      case packets.types.LEAVE: {
        if(!player) throw new Error(`User not joined`);
        
        this.removeEntity(player);
  
        console.log(player.name + " left the game");
        break;
      }
      
      case packets.types.CHAT: {
        if(!player) throw new Error(`User not joined`);
        
        ws.send(packets.chat(data.name, player.name));
        break;
      }
      
      case packets.types.MOVE: {
        if(!player) throw new Error(`User not joined`);
        
        player.move(data.key, data.pressed);
        break;
      }
      
      default: {
        throw new Error(`Unknown message type: \`${data.type}\``);
      }
    }
  }
}
