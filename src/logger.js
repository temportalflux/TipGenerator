const EventLogger = require('node-windows').EventLogger;
const { serviceName } = require('../package.json');

const log = new EventLogger({
	source: serviceName,
	eventLog: 'Application'
});

module.exports = {
	info: (message) => {
		console.log(message);
		log.info(message);
	},
	warn: (message) => {
		console.log(message);
		log.warn(message);
	},
	error: (message) => {
		console.error(message);
		log.error(message);
	},
};
