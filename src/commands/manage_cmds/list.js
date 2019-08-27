const lodash = require('lodash');
const Sql = require('sequelize');

module.exports = {
	command: 'list <status> <assetType> [count] [page]',
	desc: 'Get entries for an asset type.',
	builder: {
		status: {
			type: 'string',
			choices: ['pending', 'approved'],
			describe: 'The status of the items',
			demandOption: true,
		},
		assetType: {
			type: 'string',
			choices: ['tip', 'background'],
			describe: 'The item type',
			demandOption: true,
		},
		count: {
			type: 'int',
			describe: 'The amount of items per page',
			default: 10,
		},
		page: {
			type: 'int',
			describe: 'The page offset',
			default: 0,
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
		
		const {rows, count} = await Model.findAndCountAll({
			where: {
				status: {
					[Sql.Op.eq]: argv.status
				},
			},
			offset: argv.page * argv.count,
			limit: argv.count,
		});
		const text = rows.reduce((accum, modelInst) =>
		{
			accum += `\n(${modelInst.dataValues.id}) ${modelInst.dataValues.text}`;
			return accum;
		}, `Page ${argv.page} (${argv.page * argv.count + 1} - ${(argv.page + 1) * argv.count}): (${count} total)`);

		await argv.message.channel.send(text);

	},
};