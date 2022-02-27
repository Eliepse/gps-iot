import {TrackerListener} from 'src/tracker/TrackerListener';

export class DelayedTrackerListener extends TrackerListener {
	/** @member {function(GPSState): void} */
	action;

	/** @member {Number} */
	_delay;

	/** @member {GPSState} */
	_lastGPSState;

	/** @member {Number} */
	_nextActionTime;

	/** @member {Number} */
	_timeout;

	/**
	 * @param {function(GPSState): void} action
	 * @param {Object=} config
	 * @param {Number=} config.delay
	 */
	constructor(action, config = {}) {
		super();
		const {delay = 2_000} = config;
		this.action = action;
		this._delay = delay;
	}

	/**
	 *
	 * @param {GPSState} state
	 */
	updateState(state) {
		this._lastGPSState = state;
		const now = Date.now();

		if (this._nextActionTime > now) {
			return;
		}

		this.triggerAction();
	}

	triggerAction() {
		// Prevent triggering any update if the last state
		// has already been sent out (before a timeout).
		if (!this._lastGPSState) {
			return;
		}

		clearTimeout(this._timeout);

		// Update the action with the last state and flush it
		this.action(this._lastGPSState);
		this._lastGPSState = undefined;

		// Add a timeout to automatically triggers an update
		// if the state is updated before the delay
		this._timeout = setTimeout(() => {
			this.triggerAction();
		}, this._delay);

		// Update the next update time
		this._nextActionTime = Date.now() + this._delay;
	}

	stop() {
		clearTimeout(this._timeout);
	}

	onUpdate() {
	}
}
