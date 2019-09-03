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
		const tip = Utils.Math.pickRandom(tips);
		await argv.message.reply(
			tip.get('text'),
			{
				embed: {
					title: `Tip id #${tip.hash}`,
					fields: [
						{
							name: 'Tip Source',
							value: tip.authorUrl ? tip.authorUrl : 'Unknown Source',
							inline: true,
						},
					],
				},
			}
		);
	},
};