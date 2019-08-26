module.exports = {
	command: 'tip <text>',
	desc: 'Submit a tip to be added to the generator.',
	builder: {},//(yargs) => yargs.help(),
	handler: async (argv) =>
	{
		argv.application.Tip.create({
				status: 'pending',
				text: argv['text'],
		});
		await argv.message.reply("Your entry is pending approval by someone with manager privleges.");
	},
};