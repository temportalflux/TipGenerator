const lodash = require('lodash');

const DiscordBot = require('./DiscordBot.js');
const CommandListener = require('./CommandListener.js');

const Database = require('./database/Database.js');
const ModelTips = require('./database/ModelTips.js');
const ModelBackgrounds = require('./database/ModelBackgrounds.js');
const ModelUsage = require('./database/ModelUsage.js');
const ModelCreation = require('./database/ModelCreation.js');
const Sql = require('sequelize');

const RemoteFile = require('./RemoteFile.js');

require('canvas').registerFont('./assets/dungeon.ttf', { family: 'DnD' });

class Application
{

	constructor()
	{
		const gitAssets = 'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets';
		this.remoteFiles = {
			tip: new RemoteFile(`${gitAssets}/tips.json`),
			background: new RemoteFile(`${gitAssets}/backgrounds.json`),
		};

		this.commandListener = new CommandListener({
			application: this,
			prefix: 'dndtip',
			list: require('./commands/index.js'),
		});

		this.initBot(); // async

		this.init(); // async
	}

	async init()
	{
		await this.createDatabase('tipgenerator.db', 'sqlite');
		await this.fetchRemoteFiles();
	}

	async createDatabase(databaseName, dialect)
	{
		this.database = new Database(databaseName, dialect, {
			tip: { attributes: ModelTips },
			background: { attributes: ModelBackgrounds },
			usage: { attributes: ModelUsage, options: { timestamps: true } },
			creation: { attributes: ModelCreation, options: { timestamps: true } },
		});

		this.database.models.usage.belongsTo(this.database.models.creation);
		this.database.models.usage.belongsTo(this.database.models.tip);
		this.database.models.usage.belongsTo(this.database.models.background);

		this.database.models.creation.belongsTo(this.database.models.tip);
		this.database.models.creation.belongsTo(this.database.models.background);

		await this.database.init();
		await this.database.sync();

		lodash.assignIn(this, lodash.toPairs(this.database.models).reduce((accum, [key, model]) => {
			accum[key.replace(
				/(\w)(\w*)/g,
				(g0,g1,g2) => g1.toUpperCase() + g2.toLowerCase()
			)] = model;
			return accum;
		}, {}));
	}

	async initBot()
	{
		this.bot = new DiscordBot({
			application: this,
			token: require('../secret.json').token
		});

		this.bot.on('messageReceived', (msg) => this.commandListener.processMessage(msg.content));

		await this.bot.login();
	}

	async parseRemoteFile(remoteFile)
	{
		try
		{
			const content = await remoteFile.get();
			return JSON.parse(content);
		}
		catch (err)
		{
			console.error('Failed to get remote file:', err);
		}
	}

	async loadRemoteData(category, data, model, valueToEntry, findParamsForEntry)
	{
		if (data === undefined) return;

		// keys of data is the status
		// values are array of entries
		const valueSets = lodash.toPairs(data);
		const entries = valueSets.reduce((accum, [status, values]) =>
		{
			console.log(`Loading fetched data from remote for ${status} ${category}...`);
			return accum.concat(values.map((value) => valueToEntry(status, value)));
		}, []);
		const entriesToAdd = [];
		for (const entry of entries)
		{
			const instance = await model.findOne({ where: findParamsForEntry(entry) });
			if (instance === null)
			{
				entriesToAdd.push(entry);
			}
		}
		if (entriesToAdd.length > 0)
		{
			try
			{
				await model.bulkCreate(entriesToAdd);
			}
			catch (errors)
			{
				console.error(errors);
			}
		}
	}

	async fetchRemoteFiles()
	{
		await this.loadRemoteData('tips',
			await this.parseRemoteFile(this.remoteFiles.tip),
			this.database.models.tip,
			(status, value) =>
			{
				return {
					status: status,
					text: value,
				};
			},
			(entry) => {
				return {
					text: {
						[Sql.Op.eq]: entry.text,
					}
				};
			}
		);
		await this.loadRemoteData('backgrounds',
			await this.parseRemoteFile(this.remoteFiles.background),
			this.database.models.background,
			(status, value) =>
			{
				return {
					status: status,
					name: value.name,
					url: value.url,
				};
			},
			(entry) => {
				return {
					name: {
						[Sql.Op.eq]: entry.name,
					},
					url: {
						[Sql.Op.eq]: entry.url,
					},
				};
			}
		);
	}

}

new Application();