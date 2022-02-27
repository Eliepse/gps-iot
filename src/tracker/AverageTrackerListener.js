import {TrackerListener} from 'src/tracker/TrackerListener';
import {Coordinate} from 'src/Coordinate';

export class AverageTrackerListener extends TrackerListener {
	/** @member {function(Coordinate): void} */
	action;

	/** @member {GPSState[]} */
	_states = [];

	/** @member {Number} */
	_delay;

	/**
	 * @param {function(Coordinate): void} action
	 * @param {Object=} config
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
		if (this._isDelayExpired()) {
			this.action(this._getAverageCoordinate(this._states));
			this._states = [];
		}

		this._states.push(state);
	}

	_isDelayExpired() {
		if (this._states.length === 0) {
			return false;
		}

		return this._states[0].time.getTime() + this._delay <= Date.now();
	}

	/**
	 * @param {GPSState[]} states
	 * @private
	 */
	_getAverageCoordinate(states) {
		const sum = states.reduce(
			(carr, state) => [
				carr[0] + state.coordinate.lon,
				carr[1] + state.coordinate.lat,
				carr[2] + state.coordinate.altitude,
			],
			[0, 0, 0],
		);
		return new Coordinate(sum[0] / states.length, sum[1] / states.length, sum[2] / states.length);
	}

	onUpdate() {
	}
}
