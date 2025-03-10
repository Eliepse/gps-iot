/** @type {{ token: String= }} */
import args from "node-args";
import {App} from 'src/App';
import Axios from "axios";
import fs from "fs";
import dotenv from 'dotenv';
import {ApiService} from 'src/services/ApiService';
import path from 'path';
import log4js from 'log4js';
import {EventSourceService} from 'src/services/EventSourceService';
import {GPSTrackingService} from 'src/services/GPSTrackingService';
import {ActionsService} from 'src/services/ActionsService';

dotenv.config({path: path.resolve(process.cwd(), ".env")});
log4js.configure({
	appenders: {
		out: {type: "stdout"},
		app: {type: "dateFile", filename: "logs/gps.log", keepFileExt: true, alwaysIncludePattern: true, numBackups: 7},
	},
	categories: {
		default: {appenders: ["out", "app"], level: process.env.LOG_LEVEL || "info"},
	},
});

/** @var {App} app */
export let app;
const logger = log4js.getLogger();

if (!process.env.TRACKER_UID) {
	logger.error("Missing TRACKER_UID env");
	log4js.shutdown(() => process.exit(1));
}

if (!process.env.API_URL) {
	logger.error("Missing API_URL env");
	log4js.shutdown(() => process.exit(1));
}

if (args.token) {
	Axios.post(`${process.env.API_URL}/api/tracker/${process.env.TRACKER_UID}/register`, {token: args.token})
		.then((response) => {
			logger.info("Device registered");
			logger.info("Token created");
			const tokenPath = path.resolve(process.cwd(), ".token");
			fs.writeFileSync(tokenPath, response.data.token);
			process.exit();
		})
		.catch((error) => {
			logger.error(`Failed registering the tracker: ${error.message}`);
			log4js.shutdown(() => process.exit(1));
		});
}

if (!args.token) {
	const tokenPath = path.resolve(process.cwd(), ".token");
	const token = fs.existsSync(tokenPath) ? fs.readFileSync(tokenPath).toString().trim() : null;

	app = new App(process.env.TRACKER_UID, token);
	app.setServices(
		ApiService,
		EventSourceService,
		GPSTrackingService,
		ActionsService,
	);
	app.boot();
}
