const path = require('path');
const lodash = require('lodash');
const fetch = require('node-fetch');

const DBL = require('discordbot-lib');
const Secrets = require('../secrets.json');
const Models = require('./models/index.js');

require('canvas').registerFont('./assets/dungeon.ttf', { family: 'DnD' });

class TipGenerator extends DBL.Application
{

	constructor(withService)
	{
		super({
			applicationName: 'TipGenerator',
			discordToken: Secrets.token,
			commands: {
				prefix: 'dndtip',
				directory: path.join(__dirname, 'commands'),
			},
			databaseModels: Models,
			databaseLogging: false,
			withService: withService,
			logger: withService
				? DBL.Service.Logger(require('../package.json').serviceName)
				: undefined,
		});
		this.generateTipScreen = require('./generator.js');
	}

	// Overriden from Application
	async setupDatabase()
	{
		this.database.models.usage.belongsTo(this.database.models.creation);
		this.database.models.usage.belongsTo(this.database.models.tip);
		this.database.models.usage.belongsTo(this.database.models.background);

		this.database.models.creation.belongsTo(this.database.models.tip);
		this.database.models.creation.belongsTo(this.database.models.background);
	}

	async onDatabaseInit()
	{
		/*
		try
		{
			await this.database.db.queryInterface.addConstraint(
				'tips', ['guild', 'text'], { type: 'unique' }
			);
			await this.database.db.queryInterface.addConstraint(
				'backgrounds', ['guild', 'name'], { type: 'unique' }
			);
			await this.database.db.queryInterface.addConstraint(
				'backgrounds', ['guild', 'url'], { type: 'unique' }
			);	
		}
		catch(e)
		{
			console.error(e);
		}
		//*/
	}

	// Overriden from Application
	async onDatabaseReady()
	{
		lodash.assignIn(this, lodash.toPairs(this.database.models).reduce((accum, [key, model]) =>
		{
			accum[key.replace(
				/(\w)(\w*)/g,
				(g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
			)] = model;
			return accum;
		}, {}));
	}

	// Override from DBL.Application
	onBotPrelogin(bot)
	{
		super.onBotPrelogin(bot);
		bot.on('removedFromGuild', this.onRemovedFromGuild.bind(this));
		bot.on('joinedGuild', this.onJoinedGuild.bind(this));
		bot.on('leftGuild', this.onLeftGuild.bind(this));
	}

	// Overriden from Application
	async onBotReady(client)
	{
		if (this.withService)
			await this.logger.info(`${this.applicationName} ready and connected to client`);
		else
			console.log(`${this.applicationName} ready and connected to client`, lodash.cloneDeep(client));

		await this.checkForAutogen();
	}

	enqueueNextAutogenCheck()
	{
		if (!this.autogenTimer)
		{
			// Try to get as close to the next minute as possible
			const now = new Date();
			const secondsTillNextMinute = -now.getSeconds();
			const msTillNextCheck = 1000 * (60 + secondsTillNextMinute);
			this.autogenTimer = setTimeout(this.checkForAutogen.bind(this), msTillNextCheck);
			return msTillNextCheck;
		}
		return -1;
	}

	async onJoinedGuild(guild)
	{
		await this.logger.info(`Joined guild "${guild.name}"#${guild.id}.`);
		await this.addGuildData(guild);
	}

	async onLeftGuild(guild)
	{
		await this.logger.info(`Left guild "${guild.name}"#${guild.id}.`);
		await this.removeGuildData(guild);
	}

	async onRemovedFromGuild(guild)
	{
		await this.logger.info(`Removed from guild "${guild.name}"#${guild.id}.`);
		await this.removeGuildData(guild);
	}

	async addGuildData(guild)
	{
		await this.logger.info(`Fetching approved data for "${guild.name}"#${guild.id}.`);
		await this.initRemoteFiles(guild.id);
	}

	async removeGuildData(guild)
	{
		await this.logger.info(`Purging data for "${guild.name}"#${guild.id}.`);
		for (const modelKey of lodash.keys(this.database.models))
		{
			await this.database.at(modelKey).destroy(
				DBL.Utils.Sql.createSimpleOptions({ guild: guild.id })
			);
		}
	}

	async initRemoteFiles(guildId)
	{
		const gitAssets = 'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets';
		await this.loadRemoteData('tip', guildId,
			{
				url: `${gitAssets}/tips.json`,
				fields: ['text', 'authorUrl'],
				filterOn: ['guild', 'text'],
			}
		);
		await this.loadRemoteData('background', guildId,
			{
				url: `${gitAssets}/backgrounds.json`,
				fields: ['name', 'url', 'authorUrl'],
				filterOn: ['guild', 'name', 'url'],
			}
		);
	}

	async loadRemoteData(modelKey, guildId, options)
	{
		const result = await fetch(options.url, { method: 'GET' });
		const approvedData = await result.json();
		try
		{
			await this.database.importWithFilter(
				modelKey,
				approvedData.reduce(
					(accum, entry) => accum.concat(
						({ ...entry, guild: guildId, status: 'approved', })
					),
					[]
				),
				(entry) => DBL.Utils.Sql.createWhereFilter(lodash.pick(entry, options.filterOn)),
				(entry) => entry
			);
		}
		catch (e)
		{
			this.logger.error(e);
		}
	}

	increaseDateUntitItIsInTheFuture(startDate, days, now)
	{
		const frequency = days * 86400000;
		while (startDate < now)
		{
			startDate = new Date(startDate.getTime() + frequency);
		}
		return startDate;
	}

	async checkForAutogen()
	{
		// Disable the autogen timer
		if (this.autogenTimer)
		{
			clearTimeout(this.autogenTimer);
			this.autogenTimer = null;
		}

		if (this.withService)
			await this.logger.info(`Checking the autogeneration schedule...`);
		else
			console.log(`Checking the autogeneration schedule...`);

		const now = new Date();
		const schedules = await this.database.at('autogen').findAll();

		/*
		await this.logger.info(`Fetched all autogeneration information from database. Found ${schedules.length} schedules. ${JSON.stringify(schedules)}`);
		for (var [key, value] of this.bot.client.guilds)
		{
			await this.logger.info(`Guild: ${key} (${typeof key}) => ${value} (${typeof value})`);
		}
		//*/

		for (let index = 0; index < schedules.length; index++)
		{
			const schedule = schedules[index];
			//await this.logger.info(`Analyzing schedule ${index}, ${JSON.stringify(schedule)} guildExistsInMap:${this.bot.client.guilds.has(schedule.guild)}`);

			const guild = this.bot.client.guilds.get(schedule.guild);
			//await this.logger.info(`Schedule ${index} | guild:${guild} (${typeof guild}) name:${guild.name} id:${guild.id}`);
			const channel = guild.channels.get(schedule.channel);
			//await this.logger.info(`Schedule ${index} | channel:${channel} (${typeof channel}) name:${channel.name} id:${channel.id}`);

			const startDate = new Date(schedule.startDate);
			// Don't process if the schedule hasnt started yet
			if (now < startDate)
			{
				await this.logger.info(`guild-channel ${guild.name}-${channel.name} hasnt started their schedule yet. ${now.toString()} < ${startDate.toString()}`);
				continue;
			}

			const nextUpdate = new Date(schedule.nextGeneration);
			if (nextUpdate < now)
			{
				const nextGenDateTime = this.increaseDateUntitItIsInTheFuture(nextUpdate, schedule.frequency, now);
				const otherDebugText = '\nDEBUG INFO:'
				+ `\nGeneration schedule started at: ${startDate.toString()}`
				+ `\nNext generation was schedule at: ${nextUpdate.toString()}`
				+ `\nGenerated at: ${now.toString()}`
				+ `\nGeneration Frequency is: ${schedule.frequency} days`
				+ `\nNext generation will be at: ${nextGenDateTime.toString()}`
				;
				await this.generateTipScreen(guild, this, channel, true, otherDebugText);
				await schedule.update({ nextGeneration: nextGenDateTime });
				await this.logger.info(`Generated tip screen for guild-channel ${guild.name}-${channel.name}.`);
			}
			else
			{
				await this.logger.info(`Skipping guild-channel ${guild.name}-${channel.name}, ${nextUpdate.toString()} >= ${now.toString()}`);
			}

		}

		const msTillNextCheck = this.enqueueNextAutogenCheck();
		var finishedLog = 'Finished checking the autogen schedule.';
		if (msTillNextCheck >= 0)
		{
			finishedLog += ` Next autogen check scheduled for ${msTillNextCheck / 1000} seconds from now.`;
		}
		await this.logger.info(finishedLog);
	}

}

module.exports = TipGenerator;