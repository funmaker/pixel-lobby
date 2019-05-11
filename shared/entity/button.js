import Entity from "./entity";
import { PHYSICS_TYPE } from "../physics";
import { Vector } from "../math";

export default class Button extends Entity {
  static type = Entity.registerType("Button", this);
  physics = PHYSICS_TYPE.NONE;
  action = null;
  
  constructor(pos, size, action) {
    super();
    this.pos = pos;
    this.size = size;
    this.action = action;
    if(CLIENT) {
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("click", this.onClick);
    }
  }
  
  onRemove() {
    if(CLIENT) {
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("click", this.onClick);
    }
  }
  
  static deserialize(entityState) {
    return new Button(new Vector(entityState.pos), new Vector(entityState.extra.size), entityState.extra.action)
  }
  
  getExtraState() {
    return {
      size: this.size,
      action: this.action,
    }
  }
  
  onMouseMove = ev => {
    if(this.mouseHover(ev.clientX, ev.clientY) && !this.mouseHover(ev.clientX - ev.movementX, ev.clientY - ev.movementY)) {
      GAME.render.canvas.style.cursor = "pointer";
    } else if(!this.mouseHover(ev.clientX, ev.clientY) && this.mouseHover(ev.clientX - ev.movementX, ev.clientY - ev.movementY)) {
      GAME.render.canvas.style.cursor = "default";
    }
  };
  
  onClick = ev => {
    if(this.action && this.mouseHover(ev.clientX, ev.clientY)) {
      switch(this.action.type) {
        case "boardTool":
          GAME.localPlayer.boardTool = {
            lineWidth: this.action.lineWidth,
            clear: this.action.clear,
          };
          break;
          
        default:
          console.log(`Unknown button action: ${this.action.type}`)
      }
    }
  };
  
  static boardTool = (lineWidth, clear) => ({ type: "boardTool", lineWidth, clear });
}
