import { createCanvas } from "canvas";
import Entity from "./entity";
import { Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";
import * as packets from "../packets";

export default class Board extends Entity {
  physics = PHYSICS_TYPE.NONE;
  canvas; ctx;
  
  constructor(pos, size) {
    super();
    this.pos = pos;
    this.size = size;
    this.canvas = createCanvas(size.x, size.z);
    this.ctx = this.canvas.getContext("2d");
    if(CLIENT) {
      window.addEventListener("mousemove", this.onMouseMove);
    }
  }
  
  static deserialize(entityState) {
    const board = new Board(new Vector(entityState.pos), new Vector(entityState.extra.size));
    
    const image = new Image();
    image.addEventListener("load", () => {
      board.ctx.drawImage(image, 0, 0);
    });
    image.src = "data:image/png;base64," + entityState.extra.image.toString("base64");
    
    return board;
  }
  
  getExtraState() {
    return {
      size: this.size,
      image: this.canvas.toBuffer(),
    }
  }
  
  onUpdate(update) {
    super.onUpdate(update);
    
    if(update.extra.lines) update.extra.lines.forEach(({ x1, y1, x2, y2, lineWidth, clear }) => this.drawLine(x1, y1, x2, y2, lineWidth, clear));
  }
  
  onRemove() {
    if(CLIENT) {
      window.addEventListener("mousemove", this.onMouseMove);
    }
  }
  
  onDraw(ctx, deltaTime) {
    const { x, y } = this.room.localToCanvas(this.tlbCorner());
    ctx.drawImage(this.canvas, x, y);
  }
  
  onMouseMove = ev => {
    if(ev.buttons & 1) {
      const corner = this.room.localToCanvas(this.tlbCorner());
      const { x: cx, y: cy } = this.room.screenToCanvas(new Vector(ev.clientX, ev.clientY)).sub(corner);
      const ox = cx - ev.movementX / GAME.scale,
            oy = cy - ev.movementY / GAME.scale;

      if(cx >= 0 && cx < this.size.x && cy >= 0 && cy < this.size.z) {
        const lineWidth = GAME.localPlayer.boardTool ? GAME.localPlayer.boardTool.lineWidth : 1.5;
        const clear = GAME.localPlayer.boardTool ? GAME.localPlayer.boardTool.clear : false;
        this.drawLine(ox, oy, cx, cy, lineWidth, clear);
        GAME.send(packets.line(this.id, ox, oy, cx, cy, lineWidth, clear));
      }
    }
  };
  
  drawLine(x1, y1, x2, y2, lineWidth = 1.5, clear = false) {
    if(clear) this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    if(clear) this.ctx.globalCompositeOperation = 'source-over';
    
    if(SERVER) {
      if(!this.extraStateUpdate.lines) this.extraStateUpdate.lines = [];
      this.extraStateUpdate.lines.push({ x1, y1, x2, y2, lineWidth, clear });
      this.dirty = true;
    }
  }
}

Entity.types.Board = Board;
