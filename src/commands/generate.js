module.exports = {
	command: 'generate [trackUsage]',
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
		await argv.application.generateTipScreen(
			argv.message.guild,
			argv.application,
			argv.message.channel,
			argv.trackUsage
		);
	},
};