const path = require('path');
const lodash = require('lodash');

const DBL = require('discordbot-lib');
const Secrets = require('../secrets.json');
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
		lodash.assignIn(this, lodash.toPairs(this.database.models).reduce((accum, [key, model]) =>
		{
			accum[key.replace(
				/(\w)(\w*)/g,
				(g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
			)] = model;
			return accum;
		}, {}));

		this.initRemoteFiles();
	}

	async initRemoteFiles()
	{
		const gitAssets = 'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets';
		this.remoteFiles = {
			tip: new RemoteFile(`${gitAssets}/tips.json`),
			background: new RemoteFile(`${gitAssets}/backgrounds.json`),
		};
		//await this.fetchRemoteFiles();
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

	async loadRemoteData(modelKey, data, valueToEntry, findParamsForEntry, guildId)
	{
		if (data === undefined) return;

		// keys of data is the status
		// values are array of entries
		const valueSets = lodash.toPairs(data);
		const entries = valueSets.reduce((accum, [status, values]) =>
		{
			console.log(`Loading fetched data from remote for ${status} ${modelKey}...`);
			return accum.concat(values.map((value) => valueToEntry(status, value)));
		}, []);
		await this.database.importWithFilter(modelKey, entries, findParamsForEntry, (entry) => entry);
	}

	async fetchRemoteFiles(guildId)
	{
		await this.loadRemoteData('tip',
			await this.parseRemoteFile(this.remoteFiles.tip),
			(status, value) => ({
				guild: guildId, status: status,
				text: value,
			}),
			(entry) => DBL.Utils.Sql.createWhereFilter(lodash.pick(entry, ['guild', 'text']))
		);
		await this.loadRemoteData('background',
			await this.parseRemoteFile(this.remoteFiles.background),
			(status, value) => ({
				guild: guildId, status: status,
				name: value.name,
				url: value.url,
			}),
			(entry) => DBL.Utils.Sql.createWhereFilter(lodash.pick(entry, ['guild', 'name', 'url']))
		);
	}

}

new TipGenerator();