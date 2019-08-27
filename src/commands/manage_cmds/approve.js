const lodash = require('lodash');
const Sql = require('sequelize');

module.exports = {
	command: 'approve <assetType> <key>',
	desc: 'Approve pending entries from the submit command.',
	builder: {
		assetType: {
			type: 'string',
			choices: ['tip', 'background'],
			describe: 'The item type',
			demandOption: true,
		},
		key: {
			type: 'string',
			describe: 'The key for the entry.',
			demandOption: true,
		},
	},
	handler: async (argv) =>
	{
		const models = argv.application.database.models;
		if (!lodash.has(models, argv.assetType))
		{
			return;
		}
		const Model = models[argv.assetType];

		if (argv.key == 'all')
		{
			await argv.application.database.db.queryInterface.bulkUpdate(
				Model.getTableName(),
				{ status: 'approved' },
				{ status: { [Sql.Op.eq]: 'pending' } },
			);
			await argv.message.reply(`All entries have been approved and can now be accessed via give commands.`);
		}
		else
		{
			var instance = await Model.findOne({
				where: {
					status: { [Sql.Op.eq]: 'pending' },
					id: { [Sql.Op.eq]: argv.key },
				},
			});
			if (instance == null)
			{
				await argv.message.reply(
					`No such pending item with key ${argv.key}.`
				);
				return;
			}
			instance = await instance.update(
				{ status: 'approved' },
				{ fields: ['status'] }
			);
            await argv.message.reply(`The entry has been approved. It can now be accessed via give commands. "${instance.dataValues.text}"`);
		}
	},
};