import game from "./game";

export let canvas;
export let ctx;

export function registerCanvas(newCanvas) {
  canvas = newCanvas;
  ctx = canvas.getContext("2d");
  canvas.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  onResize();
}

function onResize() {
  if(!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function onDraw() {
  if(!canvas) return;
  ctx.resetTransform();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  game.onDraw(ctx);
  
  requestAnimationFrame(onDraw);
}

if(typeof window !== "undefined") {
  window.addEventListener("resize", onResize);
  requestAnimationFrame(onDraw);
}
