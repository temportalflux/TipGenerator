const submitEntry = require('./submitEntry.js');
module.exports = {
	"tip": (arguments) => { return { 'func': submitEntry('tips'), 'args': arguments.slice(1) }; },
	"art": (arguments) => { return { 'func': submitEntry('backgrounds'), 'args': arguments.slice(1) }; },
};