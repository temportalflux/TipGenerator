const { Utils } = require('discordbot-lib');

module.exports = {
	command: 'clearUsage <category>',
	desc: 'Clear the usages for a tips or backgrounds.',
	builder: {},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }

		const Model = argv.application.database.at(argv.category);
		if (!Model)
		{
			await argv.message.reply('Invalid category.');
			return;
		}

		await argv.application.database.at('usage').destroy(
			Utils.Sql.createSimpleOptions({
				guild: argv.message.guild,
				assetType: Model.getTableName(),
			})
		);

		await argv.message.reply(`Cleared ${argv.category} usages`);
	},
};