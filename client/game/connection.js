import game from "./game";

export let socket;

export function connect(callback) {
  if(socket) return callback && void callback();
  
  window.socket = socket = new WebSocket(`ws://${location.host}/ws`);
  
  socket.addEventListener("message", event => {
    const data = JSON.parse(event.data);
    
    game.handlePacket(data);
  });
  
  socket.addEventListener("open", () => {
    console.log("Connected");
    if(callback) callback();
  });
  
  socket.addEventListener("close", event => {
    console.error("Connection closed: ", event.code, event.reason);
    socket = null;
    connect();
  })
}
