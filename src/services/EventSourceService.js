import Eventsource from "eventsource";
import {Service} from 'src/services/Service';

export class EventSourceService extends Service {
	/** @type {String} */
	_lastEventId;

	/** @type {Function[]} */
	_listeners = [];

	/**
	 * @param {ApiService} ApiService
	 */
	constructor(ApiService) {
		super();
		this._api = ApiService;
	}

	boot() {
		const url = new URL(`${process.env.MERCURE_HOST}/.well-known/mercure`);
		this._api.tracker.topics.forEach((topic) => url.searchParams.append("topic", topic));

		this.es = new Eventsource(url.toString(), {
			headers: {'Authorization': `Bearer ${this._api.mercureToken}`},
			https: {rejectUnauthorized: false},
		});

		this.es.addEventListener("message", (e) => {
			this._lastEventId = e.lastEventId;
			this._emit(JSON.parse(e.data));
		});

		if (this.app.isDev()) {
			this.listen((payload) => {
				this.app.logger.debug("EventSource received a message: ", payload);
			});
		}

		return new Promise((resolve, reject) => {
			this.es.addEventListener("open", resolve);
			this.es.addEventListener("error", reject);
		});
	}

	_emit(payload) {
		this._listeners.forEach((listener) => listener(payload));
	}

	listen(callback) {
		if (typeof callback !== "function") {
			return;
		}

		this._listeners.push(callback);
	}
}