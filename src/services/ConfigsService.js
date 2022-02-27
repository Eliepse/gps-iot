import {Service} from 'src/services/Service';

export class ConfigsService extends Service {
	_configs = {};

	boot() {
		/** @type {ApiService} */
		const api = this.app.getService("ApiService");

		this._configs = {
			apiUrl: process.env.API_URL,
			websockets: {
				appKey: process.env.WS_APP_KEY,
				path: process.env.WS_PATH,
				host: process.env.WS_HOST,
				port: process.env.WS_PORT,
			},
		};

		return new Promise((resolve, reject) => {
			this.app.logger.debug("Fetch tracker informations");

			api.get("/api/tracker")
				.then(({data}) => {
					this._configs.user_id = data.user_id;
					this._configs.update_frequency = data.update_frequency;
					resolve();
				})
				.catch((error) => {
					this.app.logger.error("Failed fetching tracker info", this.app.logger.parseAxiosErrorResponse(error));
					reject();
				});
		});
	}

	get apiUrl() {
		return this._configs.apiUrl;
	}

	get updateFrequency() {
		return this._configs.update_frequency;
	}

	get userId() {
		return this._configs.user_id;
	}

	get websockets() {
		return this._configs.websockets;
	}
}