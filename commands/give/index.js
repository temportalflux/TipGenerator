module.exports = {
	"tip": (arguments) => { return { 'func': require('./getNextTip.js'), 'args': arguments.slice(1) }; },
	"image": (arguments) => { return { 'func': require('./getNextTipwithImage.js'), 'args': arguments.slice(1) }; },
};