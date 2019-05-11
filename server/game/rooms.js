import Room from "../../shared/room";
import { Vector } from "../../shared/math";
import StaticImage from "../../shared/entity/staticImage";
import Board from "../../shared/entity/board";
import Youtube from "../../shared/entity/youtube";
import Button from "../../shared/entity/button";
import SpawnZone from "../../shared/entity/zone/spawn";
import SitZone from "../../shared/entity/zone/sit";

export function generateRooms() {
  const lobby = new Room("lobby", new Vector(1310, 140, Infinity));
  lobby.addEntity(new StaticImage(new Vector(400, 140, 67.5), "main_bg"));
  lobby.addEntity(new StaticImage(new Vector(806, 0, 137.5), "beam_fg"));
  lobby.addEntity(new StaticImage(new Vector(1062, 140, 67.5), "cinema_bg"));
  lobby.addEntity(new StaticImage(new Vector(1062, 0, 27), "cinema_fg"));
  lobby.addEntity(new Board(new Vector(400.5, 139.9, 106.5), new Vector(775, 0, 99), "main"));
  lobby.addEntity(new Youtube(new Vector(1066, 139.9, 105), new Vector(320, 0, 180)));
  lobby.addEntity(new Button(new Vector(774.5, 139.9, 56.5), new Vector(3, 0, 3), Button.boardTool(1.5, false)));
  lobby.addEntity(new Button(new Vector(769.5, 139.9, 56.5), new Vector(5, 0, 3), Button.boardTool(4, false)));
  lobby.addEntity(new Button(new Vector(784, 139.9, 58), new Vector(10, 0, 6), Button.boardTool(6, true)));
  lobby.addEntity(new SpawnZone(new Vector(400, 70, 48), new Vector(140, 140, 0)));
  lobby.addEntity(new SitZone(new Vector(1062, 5, 137.5), new Vector(280, 10, 275)));
  
  return [lobby];
}
