const lodash = require('lodash');
const { TemplateCommands } = require('discordbot-lib');

module.exports = lodash.assign(
	{
		desc: 'Submit a background to be added to the generator',
	},
	TemplateCommands.addFile('background', 'background', (entry) => ({
		...entry,
		status: 'pending',
	}))
);