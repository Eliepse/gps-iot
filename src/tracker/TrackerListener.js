export class TrackerListener {
	/**
	 * @param {GPSState} state
	 * @abstract
	 */
	updateState(state) {
		this.onUpdate(state);
	}

	/**
	 * @abstract
	 */
	onUpdate() {}
}
