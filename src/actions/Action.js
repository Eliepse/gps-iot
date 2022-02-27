export class Action {
	/** @type {App} */
	app;

	/** @param {App} App */
	constructor(App) {
		this.app = App;
	}

	/** @abstract */
	mount() {}

	/** @abstract */
	unmount() {}
}