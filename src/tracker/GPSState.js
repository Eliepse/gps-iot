import {Coordinate} from 'src/Coordinate';

export class GPSState {
	/** @type {Date} */
	_time;

	/** @type {Coordinate} */
	_coordinate;

	/** @type {Object[]} */
	_satsActive;

	/** @type {Number} */
	_speed;

	_track;
	_satsVisible;

	/**
	 * @param {Date} time - Current time
	 * @param {Number} lon - Latitude
	 * @param {Number} lat - Longitude
	 * @param {Number} alt - Altitude
	 * @param {Object[]} satsActive - Array of active satellites
	 * @param {Number} speed - Speed over ground in km/h
	 * @param {Number} track - Track in degrees
	 * @param {Object[]} satsVisible - Array of all visible satellites
	 * @param {Number} pdop
	 */
	constructor({time, lon, lat, alt, satsActive, speed, track, satsVisible, pdop}) {
		this._time = time;
		this._coordinate = new Coordinate(lat, lon, alt, pdop);
		this._satsActive = satsActive;
		this._speed = speed;
		this._track = track;
		this._satsVisible = satsVisible;
	}

	get time() {
		return this._time;
	}

	/**
	 * @returns {Coordinate}
	 */
	get coordinate() {
		return this._coordinate;
	}

	get precision() {
		return this._coordinate.pdop;
	}

	get satsVisible() {
		return this._satsVisible;
	}

	get satsActive() {
		return this._satsActive;
	}

	toPostData() {
		return {
			lon: this._coordinate.lon,
			lat: this._coordinate.lat,
			time: this._time.getTime() / 1000,
			satellites: {
				visible: this._satsVisible,
				active: this._satsActive,
			},
			precision: this.coordinate.pdop,
		};
	}
}
