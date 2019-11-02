const lodash = require('lodash');

module.exports = {
	command: 'generate [trackUsage] [channel]',
	desc: 'Generate a tip with image.',
	builder: {
		trackUsage: {
			type: 'boolean',
			describe: 'Flag marking if generating will track the usage of a tip and background',
			default: false,
		}
	},
	handler: async (argv) =>
	{
		let outputChannel = argv.message.channel;

		if (argv.channel)
		{
			if (!argv.message.guild.available)
			{
				await argv.message.reply(`Failed to find channel with the name ${argv.channel}, guild is not available`);
				return;
			}
			const result = lodash.find(
				lodash.toPairs(argv.message.guild.channels),
				([id, channel]) => {
					return channel.type === 'text' && channel.name === argv.channel;
				}
			);
			if (!result)
			{
				await argv.message.reply(`No such channel with the name ${argv.channel}.`);
				return;
			}
			const [channelId, channel] = result;
			outputChannel = channel;
			// TODO: Check permissions on the channel
		}

		// This try is just to ensure the app doesn't crash if it doesn't have permission to post in that channel
		try
		{
			await argv.application.generateTipScreen(
				argv.message.guild,
				argv.application,
				outputChannel,
				argv.trackUsage
			);
		}
		catch(e)
		{}
	},
};