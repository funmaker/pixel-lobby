import { loadImage } from "canvas";

export class Drawable {
  width; height;
  
  static fallbackTexture = null;
  
  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
  }
  
  draw(ctx, x, y, scale = 1) {
    
  }
}
loadImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQImWNgYGD4/5/h/384jcJhYPjPQFAFACxQH+FxiV9uAAAAAElFTkSuQmCC").then(image => Drawable.fallbackTexture = image);

export class ChatBubble extends Drawable {
  text;
  
  constructor(text, ctx) {
    ctx.font = '10px minecraft';
    const measure = ctx.measureText(text);
    super(measure.width + 4, 12);
    
    this.text = text;
  }
  
  draw(ctx, x, y) {
    const r = 3,
          w = this.width / 2,
          h = this.height / 2;
  
    ctx.fillStyle = "#0007";
    ctx.fillRect(x - w, y - h, this.width, this.height);
  
    ctx.font = '10px minecraft';
    ctx.fillStyle = "#fff";
    ctx.fillText(this.text, x - w + 2, y + h - 2);
  }
}
