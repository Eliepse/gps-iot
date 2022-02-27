import {Service} from 'src/services/Service';
import Axios from 'axios';
import {UpdateApiTraceQueue} from 'src/api/UpdateApiTraceQueue';

export class ApiService extends Service {
	/** @type {import("axios").AxiosInstance} */
	_axios;

	boot() {
		this._axios = Axios.create({
			baseURL: process.env.API_URL,
			headers: {
				Authorization: `Bearer ${this.app._token}`,
				XDEBUG_TRIGGER: 1,
			},
		});


		return Promise.resolve();
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