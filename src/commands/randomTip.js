const { Utils } = require('discordbot-lib');

module.exports = {
	command: 'randomTip',
	desc: 'Return a random tip.',
	builder: {},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }
		const tips = await argv.application.database.at('tip').findAll(
			Utils.Sql.createSimpleOptions({
				guild: argv.message.guild.id, status: 'approved'
			})
		);
		await argv.message.reply(Utils.Math.pickRandom(tips).get('text'));
	},
};