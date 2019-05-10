import isNode from "detect-node";
import * as packets from "../../shared/packets";
import { users } from "../routes/index";
import Player from "../../shared/entity/player";
import path from "path";
import fs from "fs-extra";
import { generateRooms } from "./rooms";

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

const defaultSprites = [
  "anonymous",
  "borat",
  "hitler",
  "kkk",
  "bambo",
  "papaj",
  "exhibitionist",
  "orion",
];

export default new class Game {
  rooms = [];
  players = new Map();
  lastTick = Date.now();
  
  constructor() {
    setInterval(this.onTick, 1000 / 100);
    setInterval(this.onNetwork, 1000 / 10);
  
    if(isNode) {
      global.SERVER = true;
      global.CLIENT = false;
      global.GAME = this;
    }
    
    this.rooms = generateRooms();
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
    for(const user of users) {
      const player = this.players.get(user);
      if(player && (room == null || player.room === room)) {
        try {
          user.send(packet);
        } catch(e) {
          try {
            user.close();
          } catch(e) {}
        }
      }
    }
  }
  
  async determineSprite(name) {
    const pathname = path.join("./static/images/characters/", path.normalize(`${name}.png`).replace(/^(\.\.(\/|\\|$))+/, ''));
  
    if(await fs.pathExists(pathname)) {
      return name;
    } else {
      return defaultSprites[Math.floor(Math.random() * defaultSprites.length)];
    }
  }
  
  async handlePacket(ws, data) {
    if(data.type !== packets.types.MOVE && data.type !== packets.types.LINE) console.log(data);
    const player = this.players.get(ws);
    
    switch(data.type) {
      case packets.types.JOIN: {
        if(player) throw new Error(`User already joined`);
  
        const room = this.rooms[0];
        const sprite = await this.determineSprite(data.name).catch(console.error);
        const newPlayer = new Player(data.name, ws);
        newPlayer.changeSprite(sprite);
        room.addEntity(newPlayer);
        this.players.set(ws, newPlayer);
        ws.send(packets.state(room, newPlayer));
        
        console.log(newPlayer.name + " joined the game");
        break;
      }
      
      case packets.types.LEAVE: {
        if(!player) throw new Error(`User not joined`);
        
        player.remove();
  
        console.log(player.name + " left the game");
        break;
      }
      
      case packets.types.CHAT: {
        if(!player) throw new Error(`User not joined`);
        
        const cmd = data.text.split(" ");
        switch(cmd[0]) {
          case "!ytplay": {
            const match = cmd[1].match(YOUTUBE_REGEX);
            if(!match) return ws.send(packets.chat("Invalid URL"));
            
            const yt = [...player.room.entities.values()].filter(entity => entity.type === "Youtube")
                                                         .sort((a, b) => player.pos.sub(a).magnitude2() - player.pos.sub(b).magnitude2())[0];
            
            if(!yt) return ws.send(packets.chat("No youtube player found"));
            
            this.sendAll(packets.chat("Changing Video...", player.name));
            yt.play(match[1], 0);
            break;
          }

          default:
            this.sendAll(packets.chat(data.text, player.id));
        }
        break;
      }
  
      case packets.types.MOVE: {
        if(!player) throw new Error(`User not joined`);
    
        player.move(data.key, data.pressed);
        break;
      }
  
      case packets.types.LINE: {
        if(!player) throw new Error(`User not joined`);
        
        const board = player.room.entities.get(data.id);
        if(!board) throw new Error(`Board not found: \`${data.id}\``);
        
        const { x1, y1, x2, y2, lineWidth, clear } = data;
        board.drawLine(x1, y1, x2, y2, lineWidth, clear);
        break;
      }
      
      default: {
        throw new Error(`Unknown message type: \`${data.type}\``);
      }
    }
  }
}
