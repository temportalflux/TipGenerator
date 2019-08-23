module.exports = async (args, bot, msg) => {
	const tip = bot.tips.getNextTip();
	await msg.channel.send(tip);
	console.log(`Sent tip "${tip}" to "${msg.guild.name}"(${msg.guild.id})-"${msg.channel.name}".`);
};