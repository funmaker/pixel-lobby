import EventEmitter from "events";
import isNode from "detect-node";
import Connection from "./connection";
import * as packets from "../../shared/packets";
import { Render } from "./render";
import { handlePacket } from "./packetHandler";
import SpritesManager from "./spritesManager";

const BUSY_BRAILE = ['⠙', '⠸', '⢰', '⣠', '⣄', '⡆', '⠇', '⠋'];

export default class Game extends EventEmitter {
  render = new Render();
  connection = new Connection();
  sprites = new SpritesManager();
  lastTick = Date.now();
  lastDraw = Date.now();
  scale = 1;
  scroll = 0;
  localPlayer = null;
  room = null;
  
  constructor() {
    super();
    
    if(!isNode) {
      if(window.GAME) window.GAME.stop();
      window.SERVER = false;
      window.CLIENT = true;
      window.GAME = this;
    }
  }
  
  start(canvas) {
    this.render.start(canvas);
    this.render.on("draw", this.onDraw);
    this.connection.connect();
    this.connection.on("packet", handlePacket);
    this.sprites.loadBaseSprites();
    
    this._onTick = setInterval(this.onTick, 1000 / 100);
  }
  
  stop() {
    if(this.room) this.room.close();
    this.render.off("draw", this.onDraw);
    this.render.stop();
    this.connection.off("packet", handlePacket);
    this.connection.close();
    cancelAnimationFrame(this.onDraw);
    clearInterval(this._onTick);
    
    if(!isNode) {
      delete window.SERVER;
      delete window.CLIENT;
      delete window.GAME;
    }
  }
  
  changeRoom(room, localPlayer) {
    if(this.room && this.room !== room) this.room.close();
    this.room = room;
    this.localPlayer = localPlayer;
    this.localPlayer.takeControl();
  }
  
  send(packet) {
    this.connection.send(packet);
  }
  
  onTick = () => {
    const deltaTime = (Date.now() - this.lastTick) / 1000;
    this.lastTick = Date.now();
    
    if(this.room) this.room.onTick(deltaTime);
  };
  
  onDraw = (ctx) => {
    const deltaTime = (Date.now() - this.lastDraw) / 1000;
    this.lastDraw = Date.now();
  
    if(!this.connection.connected || !this.sprites.baseLoaded) {
      const step = Math.floor(Date.now() / 75 % BUSY_BRAILE.length);
      let line = 1;
      ctx.fillStyle = "#333";
      ctx.font = '32px sans-serif';
      if(!this.sprites.baseLoaded) {
        ctx.fillText(BUSY_BRAILE[step] + " Loading Sprites...", 16, 46 * line);
        line++;
      }
      if(!this.connection.connected) {
        ctx.fillText(BUSY_BRAILE[step] + " Connecting...", 16, 46 * line);
        line++;
      }
      return;
    }
    
    if(!this.room) return;
  
    this.scale = Math.max(Math.floor(ctx.canvas.height / 275), Math.ceil(ctx.canvas.width / 500), 1);
    
    if(this.localPlayer) {
      const x = this.localPlayer.smoothPos.x;
      const margin = ctx.canvas.width / this.scale * 0.3;
      if(this.scroll - x > margin) this.scroll = x + margin;
      if(x - this.scroll > margin) this.scroll = x - margin;
    }
    if(this.scroll < ctx.canvas.width / this.scale / 2) this.scroll = ctx.canvas.width / this.scale / 2;
    if(this.scroll > this.room.size.x - ctx.canvas.width / this.scale / 2) this.scroll = this.room.size.x - ctx.canvas.width / this.scale / 2;
    
    ctx.setTransform(this.scale, 0, 0, this.scale, ctx.canvas.width / 2 - this.scroll * this.scale, ctx.canvas.height - 275 * this.scale);
    
    this.room.onDraw(ctx, deltaTime);
  };
  
  onChat = line => {
    this.connection.send(packets.chat(line));
  };
}
