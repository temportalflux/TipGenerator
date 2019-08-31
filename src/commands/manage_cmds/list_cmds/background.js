const lodash = require('lodash');
const { TemplateCommands } = require('discordbot-lib');

module.exports = lodash.assign(
	{
		desc: 'Lists all of the images for the server.',
	},
	TemplateCommands.list(
		{
			name: 'background',
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
		'background', ['id', 'name'], (model) => `(${model.id}) ${model.name}`,
		(argv) => ({ status: argv.status })
	)
);