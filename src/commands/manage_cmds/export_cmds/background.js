const Sql = require('sequelize');
const Discord = require('discord.js');
const { Utils } = require('discordbot-lib');

module.exports = {
	command: 'background',
	desc: 'Exports a json representation of all approved backgrounds associated with this server.',
	builder: {},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }

		const exportedObject = await argv.application.database.export(
			'background',
			{
				where: Utils.Sql.createWhereFilter({
					guild: argv.message.guild.id,
					status: 'approved',
				}),
				attributes: ['name', 'url', 'authorUrl'],
			}
		);
		await argv.message.reply("Here is your exported data file", {
			files: [
				new Discord.Attachment(
					Buffer.from(JSON.stringify(exportedObject)),
					`${argv.message.guild.name.replace(' ', '-').toLowerCase()}_background.json`
				)
			]
		});
	}
};