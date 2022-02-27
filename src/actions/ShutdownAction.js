import {Action} from 'src/actions/Action';
import log4js from 'log4js';

export class ShutdownAction extends Action {

	mount() {
		// Wait for logs to complete jobs
		log4js.shutdown(() => {
			process.exit(42);
		});
	}

	unmount() {
	}
}