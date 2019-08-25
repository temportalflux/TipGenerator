const Discord = require('discord.js');
const commands = require('./commands/index.js');
const Matcher = require('./commands/matcher.js');
const AssetRepo = require('./AssetRepo.js');
const BackgroundsRepo = require('./BackgroundsRepo.js');
const Database = require('./database/Database.js');
const TableTips = require('./database/TableTips.js');
const TableBackgrounds = require('./database/TableBackgrounds.js');

class DiscordBot
{

	constructor(token, databaseName)
	{
		this.token = token;
		this.commandsMatcher = new Matcher(commands);

		// https://discord.js.org/#/docs/main/stable/general/welcome
		this.client = new Discord.Client();
		this.onClientCreated();

		this.tips = new AssetRepo(
			'./assets/tips.json',
			'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets/tips.json'
		);
		this.backgrounds = new BackgroundsRepo(
			'./assets/backgrounds.json',
			'https://raw.githubusercontent.com/temportalflux/TipGenerator/master/assets/backgrounds.json',
			'./assets/Backgrounds'
		);
		this.loadDatabase();

		this.database = new Database(databaseName, {
			tips: new TableTips(),
			backgrounds: new TableBackgrounds(),
		});
	}

	async loadDatabase()
	{
		await this.tips.load();
		await this.backgrounds.load();
	}

	async wipe()
	{
		await this.tips.wipe();
		await this.backgrounds.wipe();
	}

	async clone()
	{
		await this.tips.clone();
		await this.backgrounds.clone();
	}

	async clearUsed()
	{
		this.tips.clearUsedRecently();
		await this.tips.save();
		
		this.backgrounds.clearUsedRecently();
		await this.backgrounds.save();
	}

	getAssetSave(assetCategory)
	{
		switch (assetCategory)
		{
			case 'tips':
				return this.tips;
			case 'backgrounds':
				return this.backgrounds;
			default:
				return undefined;
		}
	}

	onClientCreated()
	{
		console.log("Discord client created");
		this.client.on('ready', this.onClientReady.bind(this));
		this.client.on('message', this.onClientMessage.bind(this));
	}

	login()
	{
		this.client.login(this.token);
	}

	onClientReady()
	{
		this.client.guilds.forEach((value, key) => {
			console.log(`Logged in as ${this.client.user.tag} on guild "${value.name}"#${key}!`);
		});
	}

	parseArguments(argumentString)
	{
		return argumentString.split(new RegExp('(".*?")', 'g')).reduce((accum, param) => {
			if (param)
			{
				const stringMatch = param.match('"(.*)"');
				if (stringMatch != null)
				{
					accum.push(stringMatch[1]);
					return accum;
				}
				else
				{
					return param.trim().split(' ').reduce((accum, entry) => {
						if (entry) return accum.concat(entry);
						else return accum;
					}, accum);
				}
			}
			return accum;
		}, []);
	}

	async onClientMessage(msg)
	{
		const match = msg.content.match(new RegExp('!dndtip (.+)'));
		if (match !== null)
		{
			const args = this.parseArguments(match[1]);
			const matched = this.commandsMatcher.execute(args);
			if (matched !== null)
			{
				await matched.func(matched.args, this, msg);
			}
		}
	}

}

module.exports = DiscordBot;