module.exports = (assetCategory) => {
	return async (args, bot, msg) => {
		const assetSave = bot.getAssetSave(assetCategory);

		if (args.length <= 0)
		{
			await msg.reply("Cannot approve an entry without the index of the entry.");
			return;
		}
		const pendingIndex = args[0];

		if (pendingIndex == 'all')
		{
			const entry = assetSave.approvePending();
			assetSave.save();
			await msg.reply(`All entries have been approved and can now be accessed via give commands.`);
		}
		else
		{
			if (pendingIndex < 0 || pendingIndex >= assetSave.getPendingCount())
			{
				await msg.reply("ERROR ERROR ERROR you gave me an invalid index - its out of bounds of my programming.");
				return;
			}

			const entry = assetSave.approvePending(pendingIndex);
			assetSave.save();
			await msg.reply(`The entry has been approved. It can now be accessed via give commands. "${assetSave.makeStringFromEntry(entry)}"`);
		}
	}
};