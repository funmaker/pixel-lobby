import { loadRequiredSprites, sprites } from "./sprites";
import { connect, socket } from "./connection";
import * as packets from "../../packets";
import Player from "./player";
import Entity from "./entity";

const busyBraile = ['⠙', '⠸', '⢰', '⣠', '⣄', '⡆', '⠇', '⠋'];
const targetHeight = 275;
const targetWidth = 800;
let name;

export default new class Game {
  spritesLoaded = false;
  connected = false;
  entities = new Map();
  lastTick = Date.now();
  keys = {
    up: { code: "KeyW", pressed: false },
    down: { code: "KeyS", pressed: false },
    left: { code: "KeyA", pressed: false },
    right: { code: "KeyD", pressed: false },
    jump: { code: "Space", pressed: false },
  };
  
  start() {
    loadRequiredSprites(() => this.spritesLoaded = true);
    connect(() => this.connected = true);
    setInterval(this.onTick, 1000 / 30);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  }
  
  onTick = () => {
    const deltaTime = (Date.now() - this.lastTick) / 1000;
    this.lastTick = Date.now();
    
    for(const entity of this.entities.values()) {
      entity.onTick(deltaTime);
    }
  };
  
  onKeyDown = ev => {
    for(const key in this.keys) {
      if(this.keys[key].code === ev.code && !this.keys[key].pressed){
        this.keys[key].pressed = true;
        this.send(packets.move(key, true));
        break;
      }
    }
  };
  
  onKeyUp = ev => {
    for(const key in this.keys) {
      if(this.keys[key].code === ev.code && this.keys[key].pressed){
        this.keys[key].pressed = false;
        this.send(packets.move(key, false));
        break;
      }
    }
  };
  
  onDraw(ctx) {
    if(!this.spritesLoaded || !this.connected) {
      const step = Math.floor(Date.now() / 75 % busyBraile.length);
      let line = 1;
      ctx.fillStyle = "#333";
      ctx.font = '32px sans-serif';
      if(!this.spritesLoaded) {
        ctx.fillText(busyBraile[step] + " Loading Sprites...", 16, 46 * line);
        line++;
      }
      if(!this.connected) {
        ctx.fillText(busyBraile[step] + " Connecting...", 16, 46 * line);
        line++;
      }
      return;
    }
    
    const scale = Math.max(Math.floor(ctx.canvas.height / targetHeight), Math.ceil(ctx.canvas.width / targetWidth), 1);
    
    ctx.setTransform(scale, 0, 0, scale, ctx.canvas.width / 2, ctx.canvas.height - targetHeight * scale / 2);
    
    sprites["main_bg"].draw(ctx, 0, 0);
    sprites["cinema_bg"].draw(ctx, 662, 0);
    
    for(const entity of this.entities.values()) {
      entity.onDraw(ctx);
    }
    
    sprites["beam_fg"].draw(ctx, 406, 0);
  }
  
  send(packet) {
    socket.send(packet);
  }
  
  createEntity(createEntity) {
    switch(createEntity.entityType) {
      case packets.entityTypes.PLAYER: {
        this.entities.set(createEntity.id, new Player(createEntity));
        break;
      }
      
      default: {
        this.entities.set(createEntity.id, new Entity(createEntity));
      }
    }
  }
  
  handlePacket(data) {
    console.log(data);
    
    switch(data.type) {
      case packets.types.STATE: {
        this.entities.clear();
        for(const createEntity of data.entities) {
          this.createEntity(createEntity);
        }
        
        if(!name) name = prompt("Enter user name");
        if(name !== null) socket.send(packets.join(name));
        break;
      }
  
      case packets.types.CREATE_ENTITY: {
        this.createEntity(data);
        break;
      }
  
      case packets.types.REMOVE_ENTITY: {
        this.entities.delete(data.id);
        break;
      }
      
      case packets.types.UPDATE: {
        for(const entityUpdate of data.entities) {
          this.entities.get(entityUpdate.id).update(entityUpdate);
        }
        break;
      }
      
      case packets.types.CHAT: {
        console.log(`${data.user}: ${data.text}`);
        break;
      }
      
      default: {
        console.error(`Unknown packet type: ${data.type}`)
      }
    }
  }
}
