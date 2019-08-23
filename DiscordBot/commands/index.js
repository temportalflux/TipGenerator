const matcher = require('./matcher.js');
module.exports = {
	'give': (arguments) => matcher(require('./give/index.js'), arguments.slice(1)),
	'submit': (arguments) => matcher(require('./submit/index.js'), arguments.slice(1)),
	'manage': (arguments) => matcher(require('./manage/index.js'), arguments.slice(1)),
};