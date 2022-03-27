import {Service} from 'src/services/Service';
import Axios from 'axios';
import {UpdateApiTraceQueue} from 'src/api/UpdateApiTraceQueue';

export class ApiService extends Service {
	/** @type {import("axios").AxiosInstance} */
	_axios;

	/** @type {String} */
	_mercureToken;

	/** @type {{topics: String[]}} */
	_tracker;

	boot() {
		this._axios = Axios.create({
			baseURL: process.env.API_URL,
			headers: {
				Authorization: `Bearer ${this.app._token}`,
				XDEBUG_TRIGGER: 1,
			},
		});

		this._axios.interceptors.response.use((response) => {
			const {'set-cookie': setCookies = []} = response.headers;

			/** @type {String|undefined} */
			const rawCookie = setCookies.find((raw) => raw.startsWith("mercureAuthorization="));

			if (!rawCookie) {
				return response;
			}

			this._mercureToken = rawCookie.match(/^mercureAuthorization=([^;]+);/)[1];
			return response;
		});

		return new Promise((resolve, reject) => {
			this.getTrackerInfo().then((res) => {
				this._tracker = res.data;
				resolve();
			}).catch(reject);
		});
	}

	getTrackerInfo() {
		return this.get("/api/tracker");
	}

	get mercureToken() {
		return this._mercureToken;
	}

	get tracker() {
		return this._tracker;
	}

	createNewTraceQueue(traceId) {
		return new UpdateApiTraceQueue(this.app, traceId, 4000);
	}

	get(...params) {
		return this._axios.get(...params);
	}

	post(...params) {
		return this._axios.post(...params);
	}
}