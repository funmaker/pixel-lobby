import Entity from "./entity";
import { sprites, loadSprite } from "./sprites";

export default class Player extends Entity {
  name = "";
  sprite = sprites["characters/default"];
  
  constructor(createEntity) {
    super(createEntity);
    
    this.name = createEntity.extra.name;
    this.updateSprite(createEntity.extra.sprite);
  }
  
  onDraw(ctx, deltaTime) {
    super.onDraw(ctx, deltaTime);
    
    const { x, y } = this.screenPos();
    const sprite = this.sprite.loaded ? this.sprite : sprites["characters/default"];
    
    ctx.save();
    ctx.translate( x, y );
    if(this.name === "sanic") {
      if(this.vel.magnitude() && this.pos.z === 0){
        ctx.rotate(Math.sin(Date.now() / 15) * 0.1);
        ctx.translate( 0, -sprite.texture.height / 2);
        sprite.draw(ctx, 0, 0);
      } else if(this.pos.z !== 0) {
        ctx.rotate((Date.now() / 30) % (Math.PI * 2));
        sprite.draw(ctx, 0, 0);
      } else {
        sprite.draw(ctx, 0, -sprite.texture.height / 2);
      }
    } else {
      if(this.vel.magnitude() && this.pos.z === 0) ctx.rotate(Math.sin(Date.now() / 50) * 0.1);
      ctx.translate( 0, -sprite.texture.height / 2);
      sprite.draw(ctx, 0, 0);
    }
    ctx.restore();
  
    ctx.font = '16px minecraft';
    const measure = ctx.measureText(this.name);
    ctx.fillStyle = "#0007";
    ctx.fillRect(x - measure.width / 2 - 2, y - sprite.texture.height - 25, measure.width + 2, 18);
    ctx.fillStyle = "#fff";
    ctx.fillText(this.name, x - measure.width / 2, y - sprite.texture.height - 10);
  }
  
  update(updateEntity) {
    super.update(updateEntity);
    
    if(updateEntity.extra.sprite) this.updateSprite(updateEntity.extra.sprite);
  }
  
  updateSprite(sprite) {
    this.sprite = loadSprite(`characters/${sprite}.png`);
  }
}
