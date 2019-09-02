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
		for (const [guildId, guild] of lodash.toPairs(client.guilds))
		{
			if (!guild.available || guild.deleted) continue;
			await this.addGuildData(guild);
		}

		await this.checkForAutogen();
		this.autogenTimer = setInterval(this.checkForAutogen.bind(this), 1000 * 60 * 30);
	}

	async onJoinedGuild(guild)
	{
		this.logger.info(`Joined guild "${guild.name}"#${guild.id}.`);
		await this.addGuildData(guild);
	}

	async onLeftGuild(guild)
	{
		this.logger.info(`Left guild "${guild.name}"#${guild.id}.`);
		await this.removeGuildData(guild);
	}

	async onRemovedFromGuild(guild)
	{
		this.logger.info(`Removed from guild "${guild.name}"#${guild.id}.`);
		await this.removeGuildData(guild);
	}

	async addGuildData(guild)
	{
		this.logger.info(`Fetching approved data for "${guild.name}"#${guild.id}.`);
		await this.initRemoteFiles(guild.id);
	}

	async removeGuildData(guild)
	{
		this.logger.info(`Purging data for "${guild.name}"#${guild.id}.`);
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

	increaseDateUntitItIsInTheFuture(startDate, frequency, now)
	{
		while (startDate < now)
		{
			startDate = new Date(startDate.getTime() + frequency);
		}
		return startDate;
	}

	async checkForAutogen()
	{
		this.logger.info("Checking autogen schedule...");
		const now = new Date();
		const schedules = await this.database.at('autogen').findAll();
		for (const schedule of schedules)
		{
			const startDate = new Date(schedule.startDate);
			// Don't process if the schedule hasnt started yet
			if (now < startDate)
			{
				this.logger.info(`${schedule.guild} hasnt started their schedule yet. ${now} < ${startDate}`);
				continue;
			}

			const nextUpdate = new Date(schedule.nextGeneration);
			if (nextUpdate < now)
			{
				const guild = this.bot.client.guilds.get(schedule.guild);
				const channel = guild.channels.get(schedule.channel);
				this.logger.info(`Generating tip screen for guild "${guild.name}"#${guild.id} in channel <@${channel.id}>.`);
				await this.generateTipScreen(guild, this, channel, true);
				await schedule.update({
					nextGeneration: this.increaseDateUntitItIsInTheFuture(nextUpdate, schedule.frequency, now)
				});
			}
			else
			{
				this.logger.info(`Skipping ${schedule.guild}, ${nextUpdate} >= ${now}`);
			}

		}
	}

}

module.exports = TipGenerator;