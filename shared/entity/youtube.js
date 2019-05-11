import YouTubePlayer from "youtube-player";
import Entity from "./entity";
import { Vector } from "../math";
import { PHYSICS_TYPE } from "../physics";
import * as packets from "../packets";

export default class Youtube extends Entity {
  static type = Entity.registerType("Youtube", this);
  physics = PHYSICS_TYPE.NONE;
  videoID = null;
  started = Date.now();
  player = null;
  playerDOM = null;
  
  constructor(pos, size) {
    super();
    this.pos = pos;
    this.size = size;
    if(CLIENT) {
      this.playerWrapper = document.createElement('div');
      document.body.prepend(this.playerWrapper);
      this.player = new YouTubePlayer(this.playerWrapper);
      this.player.on('ready', ev => this.playerRaw = ev.target);
      this.player.on('stateChange', this.onStateChange);
      this.player.getIframe().then(iframe => this.playerDOM = iframe);
      
      window.addEventListener("mousemove", this.onMouseMove);
    }
  }
  
  onRemove() {
    if(CLIENT) {
      try {
        this.player.destroy();
        this.playerWrapper.remove();
      } catch(e) {
        console.error(e);
      }
      
      window.removeEventListener("mousemove", this.onMouseMove);
    }
  }
  
  static deserialize(entityState) {
    const youtube = new Youtube(new Vector(entityState.pos), new Vector(entityState.extra.size));
    if(entityState.extra.videoID) {
      youtube.play(entityState.extra.videoID, entityState.extra.time);
    }
    return youtube;
  }
  
  getExtraState() {
    return {
      size: this.size,
      videoID: this.videoID,
      time: Date.now() - this.started,
    }
  }
  
  onUpdate(update) {
    super.onUpdate(update);
    
    if(update.extra.videoID) {
      this.play(update.extra.videoID, update.extra.time);
    }
  }
  
  onStateChange = async () => {
    const curtime = await this.player.getCurrentTime();
    const target = (Date.now() - this.started) / 1000;
    const duration = await this.player.getDuration();
    const isLive = this.playerRaw.getVideoData().isLive || this.playerRaw.getPlaybackQuality() === "auto"; // Not reliable
    if(isLive) {
      if(await this.player.getPlayerState() !== 1) await this.player.playVideo();
    } else {
      if(Math.abs(curtime - target) > 0.5 && !this.livestream) await this.player.seekTo(target, true);
      if(target < duration && await this.player.getPlayerState() !== 1) await this.player.playVideo();
    }
  };
  
  async play(videoID, time) {
    this.videoID = videoID;
    this.started = Date.now() - time;
    if(SERVER) {
      this.extraStateUpdate.videoID = videoID;
      this.extraStateUpdate.time = time;
      this.dirty = true;
    } else {
      await this.player.loadVideoById(videoID, time / 1000);
    }
  }
  
  onMouseMove = ev => {
    if(this.mouseHover(ev.clientX, ev.clientY) && !this.mouseHover(ev.clientX - ev.movementX, ev.clientY - ev.movementY)) {
      document.getElementById("root").style.pointerEvents = "none";
    } else if(!this.mouseHover(ev.clientX, ev.clientY) && this.mouseHover(ev.clientX - ev.movementX, ev.clientY - ev.movementY)) {
      document.getElementById("root").style.pointerEvents = "auto";
      this.playerDOM.blur();
    }
  };
  
  onDraw(ctx, deltaTime) {
    const corner = this.room.localToCanvas(this.tlbCorner());
    const screen = this.room.canvasToScreen(corner);
    
    ctx.globalCompositeOperation = 'destination-out';
    
    ctx.fillStyle = "white";
    ctx.fillRect(corner.x, corner.y, this.size.x, this.size.z);
    
    ctx.globalCompositeOperation = 'source-over';
    
    if(this.playerDOM) {
      this.playerDOM.style.position = "absolute";
      this.playerDOM.style.top = Math.floor(screen.y) + "px";
      this.playerDOM.style.left = Math.floor(screen.x) + "px";
      this.playerDOM.style.width = (this.size.x * GAME.scale) + "px";
      this.playerDOM.style.height = (this.size.z * GAME.scale) + "px";
    }
  }
}
