import {Service} from 'src/services/Service';
import Echo from 'laravel-echo';
import {ConfigsService} from 'src/services/ConfigsService';
import Pusher from "pusher-js";

export class WebsocketsService extends Service {
	/** @type {ConfigsService} */
	_config;

	/** @type {AuthenticationService} */
	_auth;

	/** @type {Echo} */
	_ws;

	/** @type {Channel} */
	_controlChannel;

	/** @type {PresenceChannel} */
	_trackingChannel;

	/**
	 * @param {ConfigsService} ConfigsService
	 * @param {AuthenticationService} AuthenticationService
	 */
	constructor(ConfigsService, AuthenticationService) {
		super();
		this._auth = AuthenticationService;
		this._config = ConfigsService;
	}


	boot() {
		if (process.env.LOG_PUSHER === "true") {
			Pusher.log = (...args) => this.app.logger.debug(...args);
		}

		const client = new Pusher(process.env.WS_KEY, {
			authEndpoint: "/api/broadcasting/auth",
			httpHost: process.env.API_URL,
			httpPort: process.env.API_PORT,
			wsHost: this._config.websockets.host,
			wssHost: this._config.websockets.host,
			wsPort: this._config.websockets.port,
			wssPort: this._config.websockets.port,
			forceTLS: process.env.WS_TLS === "true",
			cluster: process.env.WS_CLUSTER,
			authorizer: (channel, options) => this._auth.authorizeWebsocket(channel, options),
		});


		this._ws = new Echo({
			broadcaster: "pusher",
			client,
			authEndpoint: "/api/broadcasting/auth",
			key: process.env.WS_KEY,
			httpHost: process.env.API_URL,
			httpPort: process.env.API_PORT,
			wsHost: this._config.websockets.host,
			wssHost: this._config.websockets.host,
			wsPort: this._config.websockets.port,
			wssPort: this._config.websockets.port,
			forceTLS: process.env.WS_TLS === "true",
			cluster: process.env.WS_CLUSTER,
			ignoreNullOrigin: true,
			enableStats: false,
			enabledTransports: ['ws', 'wss'],
			authorizer: (channel, options) => this._auth.authorizeWebsocket(channel, options),
		});


		return Promise.all([
			this._connectControlChannel(),
			this._connectTrackingChannel(),
		]);
	}

	_connectControlChannel() {
		const controlChannel = `App.Models.Tracker.${process.env.TRACKER_UID}`;

		return new Promise((resolve, reject) => {
			this._controlChannel = this._ws.private(controlChannel);
			this._controlChannel.subscribed(resolve);
			this._controlChannel.error((err) => {
				this.app.logger.error(`Failed subscribing to websocket channel: ${trackingChannel}`, this.app.logger.parseAxiosErrorResponse(err));
				reject();
			});
		});
	}

	_connectTrackingChannel() {
		const trackingChannel = `tracking.${this._config.userId}`;

		return new Promise((resolve, reject) => {
			this._trackingChannel = this._ws.join(trackingChannel);
			this._trackingChannel.subscribed(resolve);
			this._trackingChannel.error((err) => {
				this.app.logger.error(`Failed subscribing to websocket channel: ${trackingChannel}`, this.app.logger.parseAxiosErrorResponse(err));
				reject();
			});
		});
	}

	get ws() {
		return this._ws;
	}

	/** @returns {PresenceChannel} */
	get trackingChannel() {
		return this._trackingChannel;
	}

	/** @returns {Channel} */
	get controlChannel() {
		return this._controlChannel;
	}
}