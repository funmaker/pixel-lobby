import EventEmitter from "events";

export class Render extends EventEmitter {
  canvas;
  ctx;
  
  start(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    
    requestAnimationFrame(this.onDraw);
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }
  
  stop() {
    cancelAnimationFrame(this.onDraw);
    window.removeEventListener("resize", this.onResize);
  }
  
  onResize = () => {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  
  onDraw = () => {
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.emit("draw", this.ctx);
    requestAnimationFrame(this.onDraw);
  };
}
