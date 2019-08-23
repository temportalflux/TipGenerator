module.exports = (args, bot, msg) => {
	if (args.length <= 0)
	{
		console.log("You did not specify a tip to be added");
	}
	else
	{
		console.log('adding your tip to the review queue', `"${args[0]}"`);
	}
};