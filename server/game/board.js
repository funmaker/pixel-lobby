import { createCanvas, loadImage } from "canvas";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../../client/game/game";

export let boardCanvas = createCanvas(BOARD_WIDTH, BOARD_HEIGHT);
export let boardCtx = boardCanvas.getContext('2d');

let buffer = [];

export function drawLine(x1, y1, x2, y2, lineWidth, clear) {
  buffer.push({x1, y1, x2, y2, width: lineWidth, clear});
  if(clear) boardCtx.globalCompositeOperation = 'destination-out';
  else boardCtx.globalCompositeOperation = 'source-over';
  boardCtx.strokeStyle = "white";
  boardCtx.lineWidth = lineWidth;
  boardCtx.beginPath();
  boardCtx.moveTo(x1, y1);
  boardCtx.lineTo(x2, y2);
  boardCtx.stroke();
}

export function flushLines() {
  const buf = buffer;
  buffer = [];
  return buf;
}

export function boardPngStream() {
  return boardCanvas.createPNGStream();
}
