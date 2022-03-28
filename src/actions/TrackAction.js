import {Action} from 'src/actions/Action';
import {DelayedTrackerListener} from 'src/tracker/DelayedTrackerListener';

export class TrackAction extends Action {
	/** @type {DelayedTrackerListener} */
	_listener;

	/** @type {UpdateApiTraceQueue} */
	_queue;

	mount() {
		/** @type {ApiService} */
		const apiService = this.app.getService("ApiService");

		/** @type {GPSTrackingService} */
		const tracking = this.app.getService("GPSTrackingService");

		this._queue = apiService.createNewTraceQueue();
		this._listener = new DelayedTrackerListener((state) => {
			if (!state) {
				return;
			}
			this._queue.add(state);
			this.app.logger.debug(state.coordinate.toString());
		});
		tracking.manager.addListener(this._listener);
	}

	unmount() {
		/** @type {GPSTrackingService} */
		const tracking = this.app.getService("GPSTrackingService");
		this._listener.stop();
		tracking.manager.removeListener(this._listener);
	}
}