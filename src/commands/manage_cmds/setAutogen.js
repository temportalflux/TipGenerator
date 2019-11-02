const lodash = require('lodash');
const { Utils } = require('discordbot-lib');

module.exports = {
	command: 'setAutogen <enabled> [startDate] [days] [channel]',
	desc: 'Toggles the autogen schedule for this server',
	builder: {
		enabled: {
			type: 'string',
			choices: ['enable', 'disable'],
			describe: 'If this server is autogenning loading screens',
			default: 'disable',
		},
		startDate: {
			type: 'string',
			describe: 'The start date and time of the auto-gen schedule',
		},
		days: {
			type: 'integer',
			describe: 'The amount of days between auto-gens',
		},
		channel: {
			type: 'string',
			describe: 'A valid channel for this server.',
		},
	},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }

		argv.isEnabled = argv.enabled === 'enable';

		if (argv.isEnabled && (!argv.startDate || !argv.days || !argv.channel))
		{
			await argv.message.reply('Please provide the startDate, days between generations, and channel to generate tips in.');
			return;
		}

		const Model = argv.application.database.at('autogen');
		if (!Model)
		{
			await argv.message.reply('Invalid category.');
			return;
		}

		if (argv.isEnabled)
		{
			const startDate = new Date(argv.startDate);
			// Storing frequency as ms is disabled due to loss of precision
			const frequency = argv.days;// * 24 * 60 * 60 * 1000; // day to ms
			const channelString = argv.channel;

			const result = lodash.find(
				lodash.toPairs(argv.message.guild.channels),
				([id, channel]) => {
					return channel.type === 'text' && channel.name === channelString;
				}
			);
			if (!result)
			{
				await argv.message.reply(`Could not understand the parameters. Please make sure your date/time is wrapped in a string.`);
				return;
			}

			const [channelId, channel] = result;

			if (!channelId)
			{
				await argv.message.reply(`No such text channel "${channelString}".`);
				return;
			}

			const isDateValid = (d) => d instanceof Date && !isNaN(d);

			if (!isDateValid(startDate))
			{
				await argv.message.reply('I cannot understand that date format. Please try "MON DD, YYYY HH:MM P/AM".');
				return;
			}

			await Model.create({
				guild: argv.message.guild.id,
				channel: channelId,
				startDate: startDate.toISOString(),
				frequency: frequency,
				nextGeneration: startDate.toISOString(),
			});
			await argv.message.channel.send(`I will auto-generate in <#${channelId}> starting on ${startDate} and every ${argv.days} days thereafter. Checking for autogens now ;)`);
			await argv.application.checkForAutogen();
		}
		else
		{
			await Model.destroy(Utils.Sql.createSimpleOptions({ guild: argv.message.guild.id }));
			await argv.message.channel.send('Removed any existing auto-gen schedules.');
		}
	},
};