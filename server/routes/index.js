import game from "../game/game";
import BSON from "bson";

export const router = require('express-promise-router')();

export const users = new Set();

router.get('/', (req, res) => {
	const initialData = {};
	
	res.react(initialData);
});

setImmediate(() => {
	router.ws("/ws", (ws, req) => {
		users.add(ws);
		console.log(`User connected: ${req.connection.remoteAddress}`);
		
		ws.on("close", (code, reason) => {
			console.log(`User disconnected: ${req.connection.remoteAddress}, ${code} - ${reason}`);
			users.delete(ws);
		});
		
		ws.on("message", data => {
			try {
				data = BSON.deserialize(data);
				game.handlePacket(ws, data);
			} catch(e) {
				ws.close(4000, e.message);
				console.error(e);
			}
		});
	});
});
