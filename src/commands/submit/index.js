const submitEntry = require('./submitEntry.js');
module.exports = {
	"tip": submitEntry('tips'),
	"art": submitEntry('backgrounds'),
};