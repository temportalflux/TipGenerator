const lodash = require('lodash');
const Sql = require('sequelize');

module.exports = {
    command: 'clearUsage <assetType>',
    desc: 'Clear the usages for a tips or backgrounds.',
    builder: {},
    handler: async (argv) =>
    {
		const models = argv.application.database.models;
		if (!lodash.has(models, argv.assetType))
		{
			return;
		}
		const Model = models[argv.assetType];

		const Usage = argv.application.Usage;
		await Usage.destroy({
			where: {
				assetType: {
					[Sql.Op.eq]: Model.getTableName()
				}
			}
		});

		await argv.message.reply(`Cleared ${argv.assetType} usages`);
    },
};