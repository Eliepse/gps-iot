import {Service} from 'src/services/Service';
import {ApiService} from 'src/services/ApiService';

export class AuthenticationService extends Service {
	_token;

	/**
	 * @param {ConfigsService} ConfigsService
	 */
	constructor(ConfigsService) {
		super();
		this._configs = ConfigsService;
	}

	boot() {
		this._token = this.app._token;
		return Promise.resolve();
	}

	get token() {
		return this._token;
	}


	}

	/**
	 * @deprecated
	 * @param channel
	 * @param options
	 * @returns {{authorize: authorize}}
	 */
	authorizeWebsocket(channel, options) {
		const api = this.app.getService("ApiService");
		return {
			authorize: (socketId, callback) => {
				this.app.logger.debug("Authorizing websocket", {channel: channel.name});

				api.post("/api/broadcasting/auth", {socket_id: socketId, channel_name: channel.name})
					.then(response => callback(false, response.data))
					.catch(error => {
						this.app.logger.error("Failed authorizing websocket", this.app.logger.parseAxiosErrorResponse(error));
						callback(true, error);
					});
			},
		};
	}
}