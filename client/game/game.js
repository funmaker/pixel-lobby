import { loadRequiredSprites, sprites } from "./sprites";
import { connect, send } from "./networking";
import { canvas } from "./canvas";
import { boardCanvas, drawLine, prepareBoard } from "./board";
import * as packets from "../../shared/packets";

const BUSY_BRAILE = ['⠙', '⠸', '⢰', '⣠', '⣄', '⡆', '⠇', '⠋'];
const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 275;
export const BOARD_WIDTH = 775;
export const BOARD_HEIGHT = 99;
const BOARD_X = -387;
const BOARD_Y = -88.5;
const BOARD_TOOLS = [
  { width: 1.5, clear: false, hover: (x, y) => x >= 373 && x <= 376 && y >= 10 && y <= 13 },
  { width:   4, clear: false, hover: (x, y) => x >= 367 && x <= 372 && y >= 10 && y <= 13 },
  { width:   6, clear:  true, hover: (x, y) => x >= 379 && x <= 389 && y >=  7 && y <= 13 },
];

export default new class Game {
  spritesLoaded = false;
  connected = false;
  entities = new Map();
  lastTick = Date.now();
  lastDraw = Date.now();
  scale = 1;
  scroll = 0;
  localPlayer = null;
  boardTool = BOARD_TOOLS[0];
  keys = {
    up: { code: "KeyW", pressed: false },
    down: { code: "KeyS", pressed: false },
    left: { code: "KeyA", pressed: false },
    right: { code: "KeyD", pressed: false },
    jump: { code: "Space", pressed: false },
  };
  
  constructor() {
    if(typeof window !== "undefined") window.GAME = this;
  }
  
  start() {
    loadRequiredSprites(() => this.spritesLoaded = true);
    connect(() => this.connected = true);
    prepareBoard(BOARD_WIDTH, BOARD_HEIGHT);
    setInterval(this.onTick, 1000 / 30);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("click", this.onClick);
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
        send(packets.move(key, true));
        break;
      }
    }
  };
  
  onKeyUp = ev => {
    for(const key in this.keys) {
      if(this.keys[key].code === ev.code && this.keys[key].pressed){
        this.keys[key].pressed = false;
        send(packets.move(key, false));
        break;
      }
    }
  };
  
  onMouseMove = ev => {
    const x = this.scroll + (ev.clientX - canvas.width / 2) / this.scale;
    const y = TARGET_HEIGHT / 2 + (ev.clientY - canvas.height) / this.scale;
    
    if(ev.buttons & 1) {
      if(x >= BOARD_X && x < BOARD_X + BOARD_WIDTH && y >= BOARD_Y && y < BOARD_Y + BOARD_HEIGHT) {
        const x1 = x - BOARD_X - ev.movementX / this.scale,
              y1 = y - BOARD_Y - ev.movementY / this.scale,
              x2 = x - BOARD_X,
              y2 = y - BOARD_Y;
        
        drawLine(x1, y1, x2, y2, this.boardTool.width, this.boardTool.clear);
        send(packets.line(x1, y1, x2, y2, this.boardTool.width, this.boardTool.clear));
      }
    }
  
    const tool = BOARD_TOOLS.find(tool => tool.hover(x, y));
    if(tool) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "default";
  };
  
  onClick = ev => {
    const x = this.scroll + (ev.clientX - canvas.width / 2) / this.scale;
    const y = TARGET_HEIGHT / 2 + (ev.clientY - canvas.height) / this.scale;
    
    const tool = BOARD_TOOLS.find(tool => tool.hover(x, y));
    if(tool) this.boardTool = tool;
  };
  
  onDraw(ctx) {
    const deltaTime = (Date.now() - this.lastDraw) / 1000;
    this.lastDraw = Date.now();
    
    if(!this.spritesLoaded || !this.connected) {
      const step = Math.floor(Date.now() / 75 % BUSY_BRAILE.length);
      let line = 1;
      ctx.fillStyle = "#333";
      ctx.font = '32px sans-serif';
      if(!this.spritesLoaded) {
        ctx.fillText(BUSY_BRAILE[step] + " Loading Sprites...", 16, 46 * line);
        line++;
      }
      if(!this.connected) {
        ctx.fillText(BUSY_BRAILE[step] + " Connecting...", 16, 46 * line);
        line++;
      }
      return;
    }
  
    if(this.localPlayer) {
      const x = this.localPlayer.smoothPos.x;
      const margin = canvas.width / this.scale * 0.3;
      if(this.scroll - x > margin) this.scroll = x + margin;
      if(x - this.scroll > margin) this.scroll = x - margin;
    }
  
    if(this.scroll < -412 + canvas.width / this.scale / 2) this.scroll = -412 + canvas.width / this.scale / 2;
    if(this.scroll >  912 - canvas.width / this.scale / 2) this.scroll =  912 - canvas.width / this.scale / 2;
    
    this.scale = Math.max(Math.floor(ctx.canvas.height / TARGET_HEIGHT), Math.ceil(ctx.canvas.width / TARGET_WIDTH), 1);
    
    ctx.setTransform(this.scale, 0, 0, this.scale, ctx.canvas.width / 2 - this.scroll * this.scale, ctx.canvas.height - TARGET_HEIGHT * this.scale / 2);
    
    sprites["main_bg"].draw(ctx, 0, 0);
    sprites["cinema_bg"].draw(ctx, 662, 0);
    ctx.drawImage(boardCanvas, BOARD_X, BOARD_Y);
    
    const entities = [...this.entities.values()].sort((a, b) => a.pos.y - b.pos.y);
    
    for(const entity of entities) {
      entity.onDraw(ctx, deltaTime);
    }
    
    sprites["beam_fg"].draw(ctx, 406, 0);
    sprites["beam_fg"].draw(ctx, -406, 0);
  }
  
  addEntity(entity) {
    this.entities.set(entity.id, entity);
  }
  
  removeEntity(id) {
    this.entities.delete(id);
  }
  
  updateLocalPlayer(localPlayer) {
    this.localPlayer = localPlayer;
  }
}
