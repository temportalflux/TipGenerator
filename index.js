const DiscordBot = require('./DiscordBot.js');
const Instance = new DiscordBot(require('./secret.json').token);
Instance.login();