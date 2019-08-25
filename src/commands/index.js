const Matcher = require('./matcher.js');
module.exports = {
	'give': new Matcher(require('./give/index.js')),
	'submit': new Matcher(require('./submit/index.js')),
	'manage': new Matcher(require('./manage/index.js')),
};