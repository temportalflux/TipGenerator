const listEntries = require('./listEntries.js');
const approvePending = require('./approvePending.js');
const Matcher = require('../matcher.js');

module.exports = {
	'db': new Matcher(require('./db/index.js')),
	"listTips": listEntries('tips'),
	"listArt": listEntries('backgrounds'),
	"approveTip": approvePending('tips'),
	"approveArt": approvePending('backgrounds'),
	"clone": async (args, bot, msg) => {
		bot.clone();
	},
	"refresh": async (args, bot, msg) => {
		bot.loadDatabase();
	},
	"clearUsed": async (args, bot, msg) => {
		bot.clearUsed();
	},
	"wipe": async (args, bot, msg) => {
		bot.wipe();
	},
};