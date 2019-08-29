const path = require('path');
const lodash = require('lodash');

const DBL = require('discordbot-lib');
const Secrets = require('../secrets.json');

const Sql = require('sequelize');
const Models = require('./models/index.js');

const RemoteFile = require('./RemoteFile.js');

require('canvas').registerFont('./assets/dungeon.ttf', { family: 'DnD' });

class TipGenerator extends DBL.Application
{

	constructor()
	{
		super({
			applicationName: 'tipgenerator',
			discordToken: Secrets.token,
			commands: {
				prefix: 'dndtip',
				directory: path.join(__dirname, 'commands'),
			},
			databaseModels: Models,
		});
	}

	// Overriden from Application
	setupDatabase()
	{
		this.database.models.usage.belongsTo(this.database.models.creation);
		this.database.models.usage.belongsTo(this.database.models.tip);
		this.database.models.usage.belongsTo(this.database.models.background);

		this.database.models.creation.belongsTo(this.database.models.tip);
		this.database.models.creation.belongsTo(this.database.models.background);
	}

	// Overriden from Application
	onDatabaseReady()
	{
		lodash.assignIn(this, lodash.toPairs(this.database.models).reduce((accum, [key, model]) => {
			accum[key.replace(
				/(\w)(\w*)/g,
				(g0,g1,g2) => g1.toUpperCase() + g2.toLowerCase()
			)] = model;
			return accum;
		}, {}));
	}

	async initRemoteFiles()
	{
		const gitAssets = 'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets';
		this.remoteFiles = {
			tip: new RemoteFile(`${gitAssets}/tips.json`),
			background: new RemoteFile(`${gitAssets}/backgrounds.json`),
		};
		await this.fetchRemoteFiles();
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

new TipGenerator();