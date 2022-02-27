import {Action} from 'src/actions/Action';
import {DelayedTrackerListener} from 'src/tracker/DelayedTrackerListener';

export class IdleAction extends Action {
	_listener;

	constructor(app) {
		super(app);

		/** @type {WebsocketsService} */
		const ws = this.app.getService("WebsocketsService");

		this._listener = new DelayedTrackerListener((state) => {
			if (!state) {
				return;
			}
			app.logger.debug(state.coordinate.toString());
			ws.trackingChannel.whisper("location", {
				coordinates: state.coordinate.toArray(),
				precision: state.precision,
			});
		}, {delay: 4_000});
	}

	mount() {
		/** @type {GPSTrackingService} */
		const tracking = this.app.getService("GPSTrackingService");
		tracking.manager.addListener(this._listener);
	}

	unmount() {
		/** @type {GPSTrackingService} */
		const tracking = this.app.getService("GPSTrackingService");
		tracking.manager.removeListener(this._listener);
	}
}