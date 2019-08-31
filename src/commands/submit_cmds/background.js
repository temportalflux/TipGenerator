const lodash = require('lodash');
const { TemplateCommands } = require('discordbot-lib');

module.exports = lodash.assign(
	{
		desc: 'Submit a background to be added to the generator',
	},
	TemplateCommands.addFile(
		(requiredParams) =>
			`background <authorUrl> ${requiredParams.reduce((accum, param) => `${accum} ${param}`, "")}`,
		'background',
		(entry, argv) => ({
			...entry,
			status: 'pending',
			authorUrl: argv.authorUrl,
		})
	)
);