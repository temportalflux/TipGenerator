const listEntries = require('./listEntries.js');
const approvePending = require('./approvePending.js');

module.exports = {
	"listTips": (arguments) => { return { 'func': listEntries('tips'), 'args': arguments.slice(1) }; },
	"listArt": (arguments) => { return { 'func': listEntries('backgrounds'), 'args': arguments.slice(1) }; },
	"approveTip": (arguments) => { return { 'func': approvePending('tips'), 'args': arguments.slice(1) }; },
	"approveArt": (arguments) => { return { 'func': approvePending('backgrounds'), 'args': arguments.slice(1) }; },
	"clone": (arguments) => { return { 'func': require('./clone.js'), 'args': arguments.slice(1) }; },
	"refresh": (arguments) => { return { 'func': require('./refresh.js'), 'args': arguments.slice(1) }; },
	"clearUsed": (arguments) => { return { 'func': require('./clearUsed.js'), 'args': arguments.slice(1) }; },
	"wipe": (arguments) => { return { 'func': require('./wipe.js'), 'args': arguments.slice(1) }; },
};