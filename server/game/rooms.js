import Room from "../../shared/room";
import { Vector } from "../../shared/math";
import StaticImage from "../../shared/entity/staticImage";
import Board from "../../shared/entity/board";
import Youtube from "../../shared/entity/youtube";
import Button from "../../shared/entity/button";

// const BOARD_TOOLS = [
//   { width: 1.5, clear: false, hover: (x, y) => x >= 373 && x <= 376 && y >= 10 && y <= 13 },
//   { width:   4, clear: false, hover: (x, y) => x >= 367 && x <= 372 && y >= 10 && y <= 13 },
//   { width:   6, clear:  true, hover: (x, y) => x >= 379 && x <= 389 && y >=  7 && y <= 13 },
// ];

export function generateRooms() {
  const lobby = new Room("lobby", new Vector(1310, 140, Infinity));
  lobby.addEntity(new StaticImage(new Vector(400, 140, 67.5), "main_bg"));
  lobby.addEntity(new StaticImage(new Vector(806, 0, 137.5), "beam_fg"));
  lobby.addEntity(new StaticImage(new Vector(1062, 140, 67.5), "cinema_bg"));
  lobby.addEntity(new Board(new Vector(400.5, 139.9, 106.5), new Vector(775, 0, 99)));
  lobby.addEntity(new Youtube(new Vector(1066, 139.9, 105), new Vector(320, 0, 180)));
  lobby.addEntity(new Button(new Vector(774.5, 139.9, 56.5), new Vector(3, 0, 3), Button.boardTool(1.5, false)));
  lobby.addEntity(new Button(new Vector(769.5, 139.9, 56.5), new Vector(5, 0, 3), Button.boardTool(4, false)));
  lobby.addEntity(new Button(new Vector(784, 139.9, 58), new Vector(10, 0, 6), Button.boardTool(6, true)));
  
  return [lobby];
}
