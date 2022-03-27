import {Service} from 'src/services/Service';
import {TrackAction} from 'src/actions/TrackAction';
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
		};

		/** @type {EventSourceService} */
		const es = this.app.getService("EventSourceService");

		es.listen((payload) => {
			this.app.logger.debug(payload);
		});

		//ws.controlChannel.notification(({type, ...data}) => {
		//	switch (type) {
		//		case 'App\\Notifications\\tracker\\StartTrackerNotification':
		//			this.act("track", data);
		//			return;
		//		case 'App\\Notifications\\tracker\\StopTrackerNotification':
		//			this.act("idle", data);
		//			return;
		//		case 'App\\Notifications\\tracker\\ShutdownTrackerNotification':
		//			this.act("shutdown", data);
		//			return;
		//	}
		//
		//	this.stopCurrent();
		//});

		this.act("track");
		return Promise.resolve();
		//return this._checkRecoveredData();
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

	//_checkRecoveredData() {
	//	/** @type {ApiService} */
	//	const api = this.app.getService("ApiService");
	//
	//	return new Promise((resolve) => {
	//		api.get("/api/recoverData").then(() => {
	//			this.act("track");
	//			resolve();
	//		}).catch((err) => {
	//			this.app.logger.error("Failed getting recovered data.", err);
	//			this.act("track");
	//			// Resolve as it's not a breaking error
	//			resolve();
	//		});
	//	});
	//}
}