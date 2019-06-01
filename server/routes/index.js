import game from "../game/game";
import configs from "../helpers/configs";
import BSON from "bson";

export const router = require('express-promise-router')();

export const connections = new Set();

router.get('/', (req, res) => {
	const initialData = {};
	
	initialData.discordClientId = configs.discord && configs.discord.client || null;
	
	res.react(initialData);
});

setImmediate(() => {
	router.ws("/ws", (ws, req) => {
		connections.add(ws);
		console.log(`Connection open: ${req.connection.remoteAddress}`);
		
		ws.on("close", (code, reason) => {
			console.log(`Connection closed: ${req.connection.remoteAddress}, ${code} - ${reason}`);
			connections.delete(ws);
		});
		
		ws.on("message", async data => {
			try {
				data = BSON.deserialize(data);
				await game.handlePacket(ws, data);
			} catch(e) {
				ws.close(4000, e.message);
				console.error(e);
			}
		});
	});
});
