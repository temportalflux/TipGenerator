
function pickRandom(values)
{
	return values[Math.floor(Math.random() * Math.floor(values.length))];
}

module.exports = {
	command: 'randomTip',
	desc: 'Return a random tip.',
	builder: {},
	handler: async (argv) =>
	{
		const Tip = argv.application.Tip;
		const tips = await Tip.findAll();
		const tip = pickRandom(tips);

		await argv.message.reply(
			tip.get('text')
		);
	},
};