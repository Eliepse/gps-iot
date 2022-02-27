import {Service} from 'src/services/Service';
import {WebsocketsService} from 'src/services/WebsocketsService';
import {TrackAction} from 'src/actions/TrackAction';
import {IdleAction} from 'src/actions/IdleAction';
import {ShutdownAction} from 'src/actions/ShutdownAction';

export class ActionsService extends Service {
	/** @type {Object<String, Action>} */
	_actions = {};

	/** @type {Action|null} */
	_current = null;

	constructor() {
		super();
	}

	boot() {
		this._actions = {
			track: new TrackAction(this.app),
			shutdown: new ShutdownAction(this.app),
			idle: new IdleAction(this.app),
		};

		/** @type {WebsocketsService} */
		const ws = this.app.getService("WebsocketsService");

		ws.controlChannel.notification(({type, ...data}) => {
			switch (type) {
				case 'App\\Notifications\\tracker\\StartTrackerNotification':
					this.act("track", data);
					return;
				case 'App\\Notifications\\tracker\\StopTrackerNotification':
					this.act("idle", data);
					return;
				case 'App\\Notifications\\tracker\\ShutdownTrackerNotification':
					this.act("shutdown", data);
					return;
			}

			this.stopCurrent();
		});

		return this._checkRecoveredData();
	}

	act(actionName, data) {
		this.stopCurrent();

		const action = this._actions[actionName];
		this.app.logger.info(`[Action][${action.constructor.name}] Start...`);
		action.mount(data);
		this._current = action;
	}

	stopCurrent() {
		if (this._current) {
			this.app.logger.info(`[Action][${this._current.constructor.name}] Stop.`);
			this._current.unmount();
			this._current = null;
		}
	}

	_checkRecoveredData() {
		/** @type {ApiService} */
		const api = this.app.getService("ApiService");

		return new Promise((resolve) => {
			api.get("/api/recoverData").then((res) => {
				if (res.status === 204) {
					this.act("idle");
					resolve();
					return;
				}

				this.act("track", {traceId: res.data.trace.id});
				resolve();
			}).catch((err) => {
				this.app.logger.error("Failed getting recovered data.", err);
				this.act("idle");
				// Resolve as it's not a breaking error
				resolve();
			});
		});
	}
}