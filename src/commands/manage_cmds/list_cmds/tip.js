const lodash = require('lodash');
const { TemplateCommands } = require('discordbot-lib');

module.exports = lodash.assign(
	{
		desc: 'Lists all of the tips for the server.',
	},
	TemplateCommands.list(
		{
			name: 'tip',
			options: '<status>',
			builderBlock: {
				status: {
					type: 'string',
					choices: ['pending', 'approved'],
					describe: 'The status of the items',
					demandOption: true,
				},
			},
		},
		'tip', ['id', 'text'], (model) => `(${model.id}) ${model.text}`,
		(argv) => ({ status: argv.status })
	)
);