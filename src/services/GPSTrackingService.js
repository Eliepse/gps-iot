import {Service} from 'src/services/Service';
import SerialPort from 'serialport';
import {TrackerManager} from 'src/tracker/TrackerManager';
import {GPSState} from 'src/tracker/GPSState';

export class GPSTrackingService extends Service {
	/** @type {SerialPort} */
	_port;

	/** @type {TrackerManager} */
	_manager;

	constructor() {
		super();
	}

	boot() {
		// Fake manager on dev env
		if (process.env.APP_ENV === "dev") {
			const listeners = [];
			//noinspection JSValidateTypes
			this._manager = {addListener: (listener) => listeners.push(listener)};

			function fakeUpdate() {
				const state = new GPSState({
					lat: 48.81 + (Math.random() * .002),
					lon: 2.30 + (Math.random() * .002),
					time: new Date(),
					satsActive: Array(Math.round(Math.random() * 4)).fill({}),
					satsVisible: Array(Math.round(Math.random() * 12)).fill({}),
				});
				listeners.forEach((listener) => listener.updateState(state));
				setTimeout(fakeUpdate, Math.round(1500 + Math.random() * 1000));
			}

			setTimeout(fakeUpdate, 3000);
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