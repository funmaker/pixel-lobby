import path from "path";
import fs from "fs-extra";
import qs from "query-string";
import axios from "axios";
import Player from "../../shared/entity/player";
import * as packets from "../../shared/packets";
import configs from "../helpers/configs";

const defaultSprites = [
  "anonymous",
  "borat",
  "hitler",
  "kkk",
  "bambo",
  "papaj",
  "exhibitionist",
  "orion",
];

export default class User {
  name = "Guest";
  sprite = "default";
  kicked = false;
  player;
  ws;
  
  constructor(ws) {
    this.ws = ws;
    
    ws.on("close", () => this.kick("Connection closed"))
  }
  
  static async create(ws, auth) {
    const user = new User(ws);
    
    if(auth.name) user.name = auth.name;
    
    if(auth.discordCode && configs.discord) {
      const { data: token } = await axios.post("https://discordapp.com/api/v6/oauth2/token", qs.stringify({
        'client_id': configs.discord.client,
        'client_secret': configs.discord.secret,
        'grant_type': 'authorization_code',
        'code': auth.discordCode,
        'redirect_uri': auth.discordRedirect,
        'scope': 'identify'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      const { data } = await axios.get("http://discordapp.com/api/v6/users/@me", {
        headers: {
          "Authorization": `Bearer ${token.access_token}`,
        }
      });
      
      user.name = data.username;
      this.id = data.id + "@discordapp.com";
    }
    
    user.sprite = await this.trySprite(user.name);
    
    GAME.sendAll(packets.chat(`${user.name} joined the game.`));
    console.log(`${user.name} joined the game.`);
    
    return user;
  }
  
  static async trySprite(sprite) {
    const pathname = path.join("./static/images/characters/", path.normalize(`${sprite}.png`).replace(/^(\.\.(\/|\\|$))+/, ''));

    if(await fs.pathExists(pathname)) {
      return sprite;
    } else {
      return defaultSprites[Math.floor(Math.random() * defaultSprites.length)];
    }
  }
  
  spawn(room) {
    const spawn = room.findEntity("SpawnZone");
    const player = new Player(this.name, this);
    player.changeSprite(this.sprite);
    if(spawn) player.pos = spawn.sample();
    room.addEntity(player);
    
    this.player = player;
    this.ws.send(packets.state(room, this.player));
  }
  
  kick(reason = "Kicked") {
    if(this.kicked) return;
    this.kicked = true;
  
    try {
      this.ws.send(packets.kick(reason));
    } catch(e) {}
    
    GAME.users.delete(this.ws);
    GAME.sendAll(packets.chat(`${this.name} left: ${reason}.`, null, this.player ? this.player.id : null));
    console.log(`${this.name} left: ${reason}.`);
    
    if(this.player) this.player.remove();
    
    try {
      this.ws.close();
    } catch(e) {}
  }
  
  send(data) {
    try {
      this.ws.send(data);
    } catch(e) {
      this.kick("Cannot send data");
    }
  }
}
