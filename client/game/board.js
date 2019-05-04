
export let boardCanvas;
export let boardCtx;

let localLineWidth;
let localClear;

export function prepareBoard(width, height) {
  boardCanvas = document.createElement("canvas");
  boardCanvas.width = width;
  boardCanvas.height = height;
  boardCtx = boardCanvas.getContext("2d");
  boardCtx.lineCap = "round";
  
  const current = new Image();
  current.addEventListener("load", () => {
    boardCtx.drawImage(current, 0, 0)
  });
  current.src = "/board.png";
}

export function setTool(lineWidth, clear) {
  localLineWidth = lineWidth;
  localClear = clear;
}

export function drawLine(x1, y1, x2, y2, lineWidth = localLineWidth, clear = localClear) {
  if(clear) boardCtx.globalCompositeOperation = 'destination-out';
  else boardCtx.globalCompositeOperation = 'source-over';
  boardCtx.strokeStyle = "white";
  boardCtx.lineWidth = lineWidth;
  boardCtx.beginPath();
  boardCtx.moveTo(x1, y1);
  boardCtx.lineTo(x2, y2);
  boardCtx.stroke();
}
