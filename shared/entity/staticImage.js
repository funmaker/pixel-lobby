import Entity from "./entity";
import { Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";

export default class StaticImage extends Entity {
  static type = Entity.registerType("StaticImage", this);
  sprite;
  physics = PHYSICS_TYPE.NONE;
  
  constructor(pos, sprite) {
    super();
    this.pos = pos;
    this.sprite = CLIENT ? GAME.sprites.get(sprite) : sprite;
  }
  
  static deserialize(entityState) {
    return new StaticImage(new Vector(entityState.pos), entityState.extra.sprite);
  }
  
  getExtraState() {
    return {
      sprite: this.sprite,
    }
  }
  
  onDraw(ctx, deltaTime) {
    const { x, y } = this.room.localToCanvas(this.pos);
    this.sprite.draw(ctx, x, y);
  }
}
