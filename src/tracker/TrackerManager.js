import GPS from 'gps';
import {GPSState} from 'src/tracker/GPSState';
import {app} from 'index';

export class TrackerManager {
	_gps;

	/** @member {TrackerListener[]} */
	_listeners = [];

	/**
	 *
	 */
	constructor(port) {
		this._gps = new GPS();
		/*
		 * TODO
		 (node:796) UnhandledPromiseRejectionWarning: Error: Error: Invalid GSA length: $GPGSA,A,3,08,01,32,27,����&�    ��b
		���G�rʪ��br���������b*�Ź����ɹ�b������bbb
		���5S�$GPGGA,222315.000,4848.9563,N,00218.0480,E,1,4,6.05,88.2,M,47.3,M,,*62
		    at GPS.updatePartial (/home/pi/gps/node_modules/gps/gps.js:872:17)
		    at SerialPort.TrackerManager.port.on.data (/home/pi/gps/build/src/tracker/TrackerManager.js:28:39)
		    at SerialPort.emit (events.js:193:13)
		    at addChunk (_stream_readable.js:295:12)
		    at readableAddChunk (_stream_readable.js:276:11)
		    at SerialPort.Readable.push (_stream_readable.js:231:10)
		    at binding.read.then (/home/pi/gps/node_modules/@serialport/stream/lib/index.js:385:12)
		(node:796) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
		(node:796) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
		 *
		 */
		port.on("data", (data) => {
			try {
				return this._gps.updatePartial(data);
			} catch (e) {
				app.logger.error(e);
			}
		});
		this._gps.on("data", () => this.updateListeners(this._gps.state));
	}

	/**
	 * @param {TrackerListener} listener
	 */
	addListener(listener) {
		this._listeners.push(listener);
	}

	updateListeners(data) {
		const state = new GPSState(data);

		if (!data.time) {
			return;
		}

		this._listeners.forEach((listener) => listener.updateState(state));
	}

	removeListener(listener) {
		this._listeners = this._listeners.filter((l) => l !== listener);
	}
}