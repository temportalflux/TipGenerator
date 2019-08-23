const Discord = require('discord.js');
const commands = require('./commands/index.js');
const matcher = require('./commands/matcher.js');
const SaveFile = require('./SaveFile.js');

class DiscordBot
{

	constructor(token)
	{
		this.token = token;
		this.client = new Discord.Client();
		this.onClientCreated();

		this.db = {
			'tips': new SaveFile('./tips.json'),
		};
		this.loadDatabase();
	}

	async loadDatabase()
	{
		this.db.forEach((value, key) => {
			value.load();
		});
	}

	onClientCreated()
	{
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
		console.log(this.client);
	}

	parseArguments(argumentString)
	{
		return argumentString.split(new RegExp('(".*?")', 'g')).reduce((accum, param) => {
			const stringMatch = param.match('"(.*)"');
			if (stringMatch != null)
			{
				accum.push(stringMatch[1]);
				return accum;
			}
			else
			{
				return accum.concat(param.trim().split(' '));
			}
		}, []);
	}

	onClientMessage(msg)
	{
		const match = msg.content.match(new RegExp('!dndtip (.+)'));
		if (match !== null)
		{
			const parameters = this.parseArguments(match[1]);
			console.log(parameters);
			const result = matcher(commands, parameters);
			if (result !== null)
			{
				result.func(result.args, this.client, msg);
			}
		}
	}

}

module.exports = DiscordBot;