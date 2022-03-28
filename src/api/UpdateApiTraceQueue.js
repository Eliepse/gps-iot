export class UpdateApiTraceQueue {
	/** @type {ApiService} */
	_api;

	/** @type {Number} */
	_delay;

	/** @type {GPSState[]} */
	_pending = [];

	/** @type {GPSState[]} */
	_sending = [];

	/** @type {Number} */
	_timeout;

	/**
	 * @param {App} app
	 * @param {Number} delay - the delay to wait before each attempt to update the Api
	 */
	constructor(app, delay) {
		this.app = app;
		this._api = app.getService("ApiService");
		this._delay = delay;
	}

	add(state) {
		this._pending.push(state);

		// Schedule if no request already scheduled
		if (!this._timeout) {
			this.scheduleUpdate();
		}

		return this;
	}

	scheduleUpdate() {
		clearTimeout(this._timeout);
		this._timeout = setTimeout(() => {
			this.updateTrace();
			this._timeout = null;
		}, this._delay);
	}

	updateTrace() {

		// We still have a request going
		if (this._sending.length > 0) {
			this.scheduleUpdate();
			return;
		}

		// Nothing to send yet
		if (this._pending.length === 0) {
			this.scheduleUpdate();
			return;
		}

		this.app.logger.debug("Update trace");

		const statesToSend = [...this._pending];
		this._pending = [];
		this._sending.push(...statesToSend);

		this._api.post(`/api/tracker/self-update`, this.toPostData(statesToSend))
			.catch((e) => {
				this.app.logger.error("Failed updating trace", this.app.logger.parseAxiosErrorResponse(e));
				this._pending.push(...statesToSend);
			})
			.finally(() => this._sending = []);
	}

	/**
	 *
	 * @param {GPSState[]} states
	 * @returns {{satellites: {visible: Number=, active: Number=}, coordinates: Object[]}}
	 */
	toPostData(states) {
		/** @type {GPSState} */
		const lastState = states[states.length - 1];
		const statesWithCoordinates = states.filter((state) => state.coordinate.valid());

		return {
			coordinates: statesWithCoordinates.map((state) => state.toPostData()) || [],
			satellites: {
				visible: lastState.satsVisible?.length,
				active: lastState.satsActive?.length,
			},
		};
	}
}