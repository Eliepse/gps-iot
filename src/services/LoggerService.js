import {Service} from 'src/services/Service';
import log4js from "log4js";

export class LoggerService extends Service {
	/** @type {import("log4js").Logger} */
	_defaultLogger;

	boot() {
		this._defaultLogger = this.getLogger();

		return Promise.resolve();
	}

	/**
	 * @param {String=} category
	 * @returns {import("log4js").Logger}
	 */
	getLogger(category) {
		return log4js.getLogger(category);
	}

	/**
	 *
	 * @param {import("axios").AxiosError} axiosError
	 * @returns {Object}
	 */
	parseAxiosErrorResponse(axiosError) {
		const {response} = axiosError;
		return {
			code: response.status,
			message: response.statusText,
			body: response.data,
		};
	}

	debug(...args) {
		return this._defaultLogger.debug(...args);
	}

	warn(...args) {
		return this._defaultLogger.warn(...args);
	}

	info(...args) {
		return this._defaultLogger.info(...args);
	}

	error(...args) {
		return this._defaultLogger.error(...args);
	}
}