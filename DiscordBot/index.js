const Discord = require('discord.js');
const secrets = require('./secret.json');
const commands = require('./commands/index.js');
const matcher = require('./commands/matcher.js');

function parseArguments(argumentString)
{
	let arguments = [];
	const matchStrParam = argumentString.split(new RegExp('(".*?")', 'g'));
	for (param of matchStrParam)
	{
		const stringMatch = param.match('"(.*)"');
		if (stringMatch != null)
		{
			arguments.push(stringMatch[1]);
		}
		else
		{
			arguments = arguments.concat(param.trim().split(' '));
		}
	}
	return arguments;
}

const client = new Discord.Client();

client.on('ready', () => {
	for (const guildKeyValue of client.guilds)
	{
		const guild = guildKeyValue[1];
		console.log(`Logged in as ${client.user.tag} on guild "${guild.name}"#${guildKeyValue[0]}!`);
	}
	console.log(client);
});

client.on('message', msg => {
	const match = msg.content.match(new RegExp('!dndtip (.+)'));
	if (match !== null)
	{
		const parameters = parseArguments(match[1]);
		console.log(parameters);
		const result = matcher(commands, parameters);
		if (result !== null)
		{
			result.func(result.args, client, msg);
		}
	}
});

client.login(secrets.token);