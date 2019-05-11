import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';
import path from "path";
import {router} from "./routes/index";
import {reactMiddleware} from "./helpers/reactHelper";
import HTTPError from "./helpers/HTTPError";

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use('/static', express.static('static'));
if(process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	app.use(require('./helpers/webpackHelper').mount());
} else {
	app.use(/.*\/((?:[0-9]+\.)?client\.js)$/, (req, res) => res.sendFile(path.join(__dirname, req.params[0])));
	app.use('/style.css', express.static('style.css'));
}


app.use(reactMiddleware);

app.use('/', router);

app.use((req, res, next) => {
	next(new HTTPError(404));
});

// noinspection JSUnusedLocalSymbols
app.use((err, req, res, next) => {
	console.error(err);
	
	const code = err.HTTPcode || 500;
	const result = {};
	result.error = {
		code: code,
		message: err.publicMessage || http.STATUS_CODES[code],
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
	};
	res.status(code).react(result);
});

export default app;