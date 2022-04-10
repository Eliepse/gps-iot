export class Coordinate {
	lat = 0.0;
	lon = 0.0;
	altitude = 0.0;

	/**
	 * The dilution of precision.
	 * Factor of inaccuracy to multiply with the
	 * sensor precision given by the manufacturer.
	 *
	 * @type {Number}
	 */
	pdop = 1.0;

	constructor(latitude, longitude, altitude, pdop = 1.0) {
		this.lat = latitude;
		this.lon = longitude;
		this.altitude = altitude;
		this.pdop = pdop;
	}

	valid() {
		return typeof this.lat === "number" && typeof this.lon === "number";
	}

	toArray() {
		return [this.lat, this.lon];
	}

	toString() {
		if (!this.lat && !this.lon) {
			return "";
		}

		return `${this.lat?.toFixed(5) || ""},${this.lon?.toFixed(5) || ""}`;
	}
}
