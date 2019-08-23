module.exports = {
	"tip": (arguments) => { return { 'func': require('./submitTip.js'), 'args': arguments.slice(1) }; },
	"image": (arguments) => { return { 'func': require('./submitBackground.js'), 'args': arguments.slice(1) }; },
};