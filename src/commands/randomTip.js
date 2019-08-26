module.exports = {
	command: 'randomTip',
	desc: 'Return a random tip.',
	builder: {},
	handler: (argv) =>
	{
		console.log('randomTip');
		/*
		const tip = bot.tips.getNextEntry();
		if (tip)
		{
			await msg.channel.send(tip);
			console.log(`Sent tip "${tip}" to "${msg.guild.name}"(${msg.guild.id})-"${msg.channel.name}".`);
		}
		//*/
	},
};