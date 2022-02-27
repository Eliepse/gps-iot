import {Service} from 'src/services/Service';
import SerialPort from 'serialport';
import {TrackerManager} from 'src/tracker/TrackerManager';

export class GPSTrackingService extends Service {
	/** @type {SerialPort} */
	_port;

	/** @type {TrackerManager} */
	_manager;

	constructor() {
		super();
	}

	boot() {
		if (process.env.APP_ENV === "dev") {
			return Promise.resolve();
		}

		this._port = new SerialPort("/dev/ttyAMA0", {
			baudRate: 9600,
			parser: new SerialPort.parsers.Readline({delimiter: "\r\n"}),
		});
		this._manager = new TrackerManager(this._port);
		return Promise.resolve();
	}

	get manager() {
		return this._manager;
	}
}