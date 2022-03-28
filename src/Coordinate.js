export class Coordinate {
	lat = 0.0;
	lon = 0.0;
	altitude = 0.0;

	constructor(latitude, longitude, altitude) {
		this.lat = latitude;
		this.lon = longitude;
		this.altitude = altitude;
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
