const lodash = require('lodash');
const Sql = require('sequelize');
const { Utils } = require('discordbot-lib');

module.exports = {
	command: 'approve <category> <key>',
	desc: 'Approve pending entries from the submit command.',
	builder: {
		category: {
			type: 'string',
			choices: ['tip', 'background'],
			describe: 'The item type',
			demandOption: true,
		},
		key: {
			type: 'string',
			describe: 'The key for the entry.',
			demandOption: true,
		},
	},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }
		if (argv.key == 'all')
		{
			const Model = argv.application.database.at(argv.category);
			if (!Model)
			{
				await argv.message.reply('Invalid category.');
				return;
			}
			await argv.application.database.db.queryInterface.bulkUpdate(
				Model.getTableName(),
				{ status: 'approved' },
				Utils.Sql.createWhereFilter({ status: 'pending' })
			);
			await argv.message.reply(`All entries have been approved and can now be accessed via give commands.`);
			return;
		}
		try
		{
			await argv.application.database.replaceField(
				argv.category,
				{ status: ['pending', 'approved'] },
				{
					guild: argv.message.guild.id,
					id: argv.key,
				}
			);
			await argv.message.reply(`The entry has been approved!`);
		}
		catch (e)
		{
			switch (e.error)
			{
				case 'InvalidModelKey':
					await argv.message.reply('Invalid category.');
					break;
				case 'InvalidSourceEntry':
					await argv.message.reply(e.message);
					break;
				case 'DestinationEntryAlreadyExists':
					await argv.message.reply(e.message);
					break;
				default:
					console.error(e);
					break;
			}
		}
	},
};