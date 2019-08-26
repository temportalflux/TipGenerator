const Discord = require('discord.js');
const lodash = require('lodash');
const events = require('events');

class DiscordBot extends events.EventEmitter
{

	constructor(options)
	{
        super();

        lodash.assignIn(this, options);

		// https://discord.js.org/#/docs/main/stable/general/welcome
		this.client = new Discord.Client();
        this.onClientCreated();
    }
    
	onClientCreated()
	{
		console.log("Discord client created");
		this.client.on('ready', this.onClientReady.bind(this));
		this.client.on('message', this.onClientMessage.bind(this));
	}

	async login()
	{
        try
        {
            await this.client.login(this.token);
            this.emit('loginComplete');
        }
        catch(err)
        {
            console.error('Could not log in bot to discord:', err);
        }
	}

	onClientReady()
	{
		this.client.guilds.forEach((value, key) => {
			console.log(`Logged in as ${this.client.user.tag} on guild "${value.name}"#${key}!`);
        });
        
        this.emit('ready');
	}

	onClientMessage(msg)
	{
        this.emit('messageReceived', msg);
	}

}

DiscordBot.events = [
    'ready',
    'loginComplete',
    'messageReceived',
];

module.exports = DiscordBot;