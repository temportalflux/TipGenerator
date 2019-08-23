const Discord = require('discord.js');
const secrets = require('./secret.json');

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
		const parameters = match[1].split(' ');
		switch (parameters[0])
		{
			case 'give':
				console.log('!dndtip', 'give', parameters.slice(1));
				break;
			case 'submit':
				console.log('!dndtip', 'submit', parameters.slice(1));
				break;
			default:
				break;
		}
	}
});

client.login(secrets.token);