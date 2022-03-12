import {Service} from 'src/services/Service';
import {LoggerService} from 'src/services/LoggerService';
import log4js from 'log4js';

const STATE = {
	init: 0,
	connecting: 1,
	idle: 2,
	tracking: 3,
};
const logger = log4js.getLogger();

export class App {
	/** @type {String} */
	_uid;

	/** @type {String} */
	_token;

	/** @type {TrackerManager} */
	_trackerManager;

	/** @type {Echo} */
	_websocket;

	/**
	 * @type {{
	 *  apiUrl: String,
	 *  websockets: {
	 *    appKey: String,
	 *    host: String,
	 *    port: String,
	 *  }
	 * }}
	 * @private
	 */
	_configs = {};

	/** @type {{order: String[], map: Object<string, Service>}} */
	_services = {
		order: [],
		map: {},
	};

	/** @type {import("axios").AxiosInstance} */
	_axios;

	/**
	 *
	 * @param {String} uid
	 * @param {String} token
	 */
	constructor(uid, token) {
		this._uid = uid;
		this._token = token;

		this.setServices(LoggerService);
		this._logger = this.getService("LoggerService");
	}

	setServices(...services) {
		services.forEach((serviceClass) => {
			// Automatic service injection
			const regExp = /constructor\s*\((.+)\)/g;
			const matches = regExp.exec(serviceClass.toString()) || [];
			const paramNames = matches[1]?.split(/\s*,\s*/) || [];
			const params = paramNames.map((name) => this.getService(name));

			/** @type {Service} */
			const service = new serviceClass(...params);
			service.app = this;
			this.registerService(service);
		});
	}

	/**
	 *
	 * @param {Service} service
	 */
	registerService(service) {
		const className = service.constructor.name;


		logger.debug(`[APP] Register service: ${className}`);

		this._services.order.push(className);
		this._services.map[className] = service;
	}

	/**
	 *
	 * @param {String} className
	 * @returns {Service|undefined}
	 */
	getService(className) {
		return this._services.map[className];
	}

	boot() {
		let i = 0;

		const bootNext = () => {
			if (i >= this._services.order.length) {
				return;
			}
			const serviceName = this._services.order[i];

			logger.debug(`[APP] Boot service: ${serviceName}`);

			this.getService(serviceName).boot()
				.then(() => {
					i++;
					bootNext();
				}).catch((e) => logger.error(`Failed booting service: ${serviceName}`, e));
		};

		bootNext();
	}

	isDev() {
		return process.env.APP_ENV !== "production";
	}

	get uid() {
		return this._uid;
	}

	/**
	 * @returns {LoggerService}
	 */
	get logger() {
		return this._logger;
	}

	shutdown() {}
}