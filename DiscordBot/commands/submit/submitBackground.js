module.exports = (args, client, msg) => {
	if (args.length <= 0)
	{
		console.log("You did not specify a tip to be added");
	}
	else
	{
		console.log('adding your background to the review queue', `"${args[0]}"`, msg.attachments);
	}
};