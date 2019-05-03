import 'source-map-support/register';
import http from 'http';
import chalk from 'chalk';
import ExpressWS from 'express-ws';

import app from './server/app';
import configs from "./server/helpers/configs";

let port = configs.port || 3000;
if(process.env.DOCKERIZED) port = 80;

const server = http.createServer(app);
const origApp = app;
let currentApp = app;
let ews = ExpressWS(app, server);
server.listen(port);

console.log(`\n${chalk.bold("Boilerplate")} started on port ${chalk.yellow.bold(port)}`);
console.log(`Environment: ${chalk.yellow.bold(process.env.NODE_ENV)}.`);
console.log(chalk.dim.white(`Press Ctrl-C to terminate.\n`));

if(module.hot) {
	module.hot.accept('./server/app', () => {
		let newApp = app;
		if(origApp === newApp) newApp = require("./server/app").default;
		ews.getWss().close();
		server.removeListener('request', currentApp);
		server.on('request', newApp);
		currentApp = newApp;
		ews = ExpressWS(currentApp, server);
	});
}

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});