import Zone from "./zone";
import Entity from "../entity";

export default class SitZone extends Zone {
  static type = Entity.registerType("SitZone", this);
}
