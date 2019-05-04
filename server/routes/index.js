import game from "../game/game";
import * as packets from "../../shared/packets";
import { boardPngStream } from "../game/board";

export const router = require('express-promise-router')();

export const users = new Set();

router.get('/', (req, res) => {
	const initialData = {};
	
	res.react(initialData);
});

router.get('/board.png', (req, res) => {
	res.setHeader('Content-Type', 'image/png');
	boardPngStream().pipe(res);
});

setImmediate(() => {
	router.ws("/ws", (ws, req) => {
		users.add(ws);
		console.log(`User connected: ${req.connection.remoteAddress}`);
		
		ws.on("close", (code, reason) => {
			console.log(`User disconnected: ${req.connection.remoteAddress}, ${code} - ${reason}`)
			users.delete(ws);
		});
		
		ws.on("message", data => {
			try {
				data = JSON.parse(data);
				game.handlePacket(ws, data);
			} catch(e) {
				ws.close(4000, e.message);
				console.error(e);
			}
		});
		
		ws.send(packets.state(game));
	});
});
