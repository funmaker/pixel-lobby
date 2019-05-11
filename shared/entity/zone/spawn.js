import Zone from "./zone";
import Entity from "../entity";

export default class SpawnZone extends Zone {
  static type = Entity.registerType("SpawnZone", this);
}
