import BSON from "bson";
import * as packets from "../../shared/packets";
import EventEmitter from "events";

export default class Connection extends EventEmitter {
  socket;
  auth;
  connected = false;
  closing = false;
  
  connect(auth = this.auth) {
    this.closing = false;
    this.auth = auth;
    this.socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
    this.socket.binaryType = 'arraybuffer';
  
    this.socket.addEventListener("message", event => {
      const data = BSON.deserialize(new Uint8Array(event.data));
      
      this.emit("packet", data);
    });
  
    this.socket.addEventListener("open", () => {
      console.log("Connected");
      this.connected = true;
      
      this.send(packets.join(auth));
    });
  
    this.socket.addEventListener("close", event => {
      console.error("Connection closed: ", event.code, event.reason);
      this.socket = null;
      if(!this.closing) {
        this.connect();
      }
    })
  }
  
  send(packet) {
    this.socket.send(packet);
  }
  
  close() {
    this.closing = true;
    if(this.socket) this.socket.close();
  }
}
