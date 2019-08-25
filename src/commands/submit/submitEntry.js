const path = require('path');

module.exports = (assetCategory) => {
	return async (args, bot, msg) => {
		const assetSave = bot.getAssetSave(assetCategory);
		console.log(msg);
		if (args.length <= 0)
		{
			await msg.channel.send("You did not specify an entry to be added.");
			return;
		}

		let entry = args[0];

		switch (assetCategory)
		{
			case 'backgrounds':
				if (args.length <= 1)
				{
					await msg.channel.send("You need to name your submission, and it must have an extension.");
					return;
				}
				const entryFilename = args[1];
				const extension = path.extname(entryFilename);
				switch (extension.slice(1))
				{
					case 'png':
					case 'jpg':
						break;
					default:
						await msg.channel.send("Your submission has an invalid file extension");
						return;
				}
				const filename = path.basename(entryFilename, extension);
				if (!filename)
				{
					await msg.channel.send("Your submission has an invalid file name");
					return;
				}
				entry = {
					url: entry,
					name: entryFilename,
				};
				break;
		}

		assetSave.addPending(entry);
		assetSave.save();
		bot.database.tables.tips.addTipPending(entry);
		await msg.reply("Your entry is pending approval by someone with manager privleges.");
	};
};