import isNode from "detect-node";
import * as packets from "../../shared/packets";
import { generateRooms } from "./rooms";
import Store from "./store";
import User from "./user";

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

export default new class Game {
  rooms = [];
  users = new Map();
  lastTick = Date.now();
  store = new Store("store.bson");
  
  constructor() {
    setInterval(this.onTick, 1000 / 100);
    setInterval(this.onNetwork, 1000 / 10);
  
    if(isNode) {
      global.SERVER = true;
      global.CLIENT = false;
      global.GAME = this;
    }
    
    setImmediate(() => this.rooms = generateRooms());
  }
  
  onTick = () => {
    const deltaTime = (Date.now() - this.lastTick) / 1000;
    this.lastTick = Date.now();
  
    this.rooms.forEach(room => room.onTick(deltaTime))
  };
  
  onNetwork = () => {
    this.rooms.forEach(room => this.sendAll(packets.update(room), room));
  };
  
  sendAll(packet, room = null) {
    for(const user of this.users.values()) {
      if(room == null || (user.player && user.player.room === room)) {
        user.send(packet);
      }
    }
  }
  
  async handlePacket(ws, data) {
    if(process.env.NODE_ENV === 'development' && data.type !== packets.types.MOVE && data.type !== packets.types.INTERACT) console.log(data);
    let user = this.users.get(ws);
    let player = user && user.player;
    
    switch(data.type) {
      case packets.types.JOIN: {
        if(user) throw new Error(`User already joined`);
        
        user = await User.create(ws, data.auth);
        this.users.set(ws, user);
        player = user.spawn(this.rooms[0]);
        break;
      }
      
      case packets.types.LEAVE: {
        if(!user) throw new Error(`User not joined`);
        
        user.kick("User left the game");
        break;
      }
      
      case packets.types.CHAT: {
        if(!user) throw new Error(`User not joined`);
        
        const cmd = data.text.split(" ");
        switch(cmd[0]) {
          case "!ytplay": {
            if(!player) return;
            
            const match = cmd[1].match(YOUTUBE_REGEX);
            if(!match) return ws.send(packets.chat("Invalid URL"));
            
            const yt = [...player.room.entities.values()].filter(entity => entity.type === "Youtube")
                                                         .sort((a, b) => player.pos.sub(a).magnitude2() - player.pos.sub(b).magnitude2())[0];
            
            if(!yt) return ws.send(packets.chat("No youtube player found."));
            
            this.sendAll(packets.chat("Changing Video...", user.name, player.id));
            yt.play(match[1], 0);
            break;
          }

          default:
            this.sendAll(packets.chat(data.text, user.name, player ? player.id : null));
        }
        break;
      }
  
      case packets.types.MOVE: {
        if(!user) throw new Error(`User not joined`);
        if(!player) return;
  
        user.player.move(data.key, data.pressed);
        break;
      }
  
      case packets.types.INTERACT: {
        if(!user) throw new Error(`User not joined`);
        if(!player) return;
        
        const entity = player.room.entities.get(data.id);
        if(!entity) throw new Error(`Entity not found: ${data.id}`);
        entity.onInteract(player, data.data);
        break;
      }
      
      default: {
        throw new Error(`Unknown message type: \`${data.type}\``);
      }
    }
  }
}
