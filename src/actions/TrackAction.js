import {Action} from 'src/actions/Action';
import {DelayedTrackerListener} from 'src/tracker/DelayedTrackerListener';

export class TrackAction extends Action {
	/** @type {DelayedTrackerListener} */
	_listener;

	/** @type {UpdateApiTraceQueue} */
	_queue;

	mount({traceId}) {
		/** @type {ApiService} */
		const apiService = this.app.getService("ApiService");

		/** @type {GPSTrackingService} */
		const tracking = this.app.getService("GPSTrackingService");

		/** @type {WebsocketsService} */
		const ws = this.app.getService("WebsocketsService");

		this._queue = apiService.createNewTraceQueue(traceId);
		this._listener = new DelayedTrackerListener((state) => {
			if (!state) {
				return;
			}
			this._queue.add(state);
			this.app.logger.debug(state.coordinate.toString());
			ws.trackingChannel.whisper("location", {
				coordinates: state.coordinate.toArray(),
				precision: state.precision,
			});
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