const Discord = require('discord.js');
const commands = require('./commands/index.js');
const matcher = require('./commands/matcher.js');
const AssetRepo = require('./AssetRepo.js');
const BackgroundsRepo = require('./BackgroundsRepo.js');

class DiscordBot
{

	constructor(token)
	{
		this.token = token;

		// https://discord.js.org/#/docs/main/stable/general/welcome
		this.client = new Discord.Client();
		this.onClientCreated();

		this.tips = new AssetRepo('./assets/tips.json');
		this.backgrounds = new BackgroundsRepo('./assets/backgrounds.json', './assets/Backgrounds');
		this.loadDatabase();
	}

	async loadDatabase()
	{
		await this.tips.load();
		await this.backgrounds.load();
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

	onClientMessage(msg)
	{
		const match = msg.content.match(new RegExp('!dndtip (.+)'));
		if (match !== null)
		{
			const args = this.parseArguments(match[1]);
			const result = matcher(commands, args);
			if (result !== null)
			{
				result.func(result.args, this, msg);
			}
		}
	}

}

module.exports = DiscordBot;