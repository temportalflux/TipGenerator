module.exports = (assetCategory) => {
	return async (args, bot, msg) => {
		const assetSave = bot.getAssetSave(assetCategory);

		if (args.length <= 0)
		{
			await msg.reply("You are missing the category, cannot list the entries without a category.");
			return;
		}
		const category = args[0];
		if (!assetSave.has(category))
		{
			await msg.reply("Why have you given me an invalid category?");
			return;
		}
		
		const allEntries = assetSave.get(category);
		if (allEntries.length <= 0)
		{
			await msg.channel.send(`There are no entries in the ${category} ${assetCategory} category.`);
		}
		else
		{
			await msg.channel.send(
				allEntries.reduce((accum, entry, i) => {
					return `${accum}\n${i}: "${assetSave.makeStringFromEntry(entry)}"`;
				}, `The entries in the ${category} ${assetCategory} category are:`)
			);
		}
	}
};