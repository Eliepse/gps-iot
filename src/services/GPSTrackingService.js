import {Service} from 'src/services/Service';
import SerialPort from 'serialport';
import {TrackerManager} from 'src/tracker/TrackerManager';
import {GPSState} from 'src/tracker/GPSState';
import SimplexNoise from 'simplex-noise';

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
		if (process.env.FAKE_DATA === "1") {
			const listeners = [];
			const simplex = new SimplexNoise();

			//noinspection JSValidateTypes
			this._manager = {addListener: (listener) => listeners.push(listener)};

			function fakeUpdate() {
				const now = Date.now() / 500_000;
				const state = new GPSState({
					lat: 48.81 + (simplex.noise2D(now, now + 6) * .005),
					lon: 2.30 + (simplex.noise2D(now + 12, now + 18) * .005),
					time: new Date(),
					satsActive: Array(Math.round(Math.random() * 4)).fill({}),
					satsVisible: Array(Math.round(Math.random() * 12)).fill({}),
					pdop: 1 + (Math.random() * 5),
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