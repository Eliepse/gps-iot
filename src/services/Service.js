export class Service {
	/** @type {App} */
	app;

	/**
	 * @returns {Promise}
	 * @abstract
	 */
	boot() {}
}