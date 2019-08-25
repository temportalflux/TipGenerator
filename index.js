const sqlite = require('sqlite3').verbose();

require('canvas').registerFont('./assets/dungeon.ttf', { family: 'DnD' });

const DiscordBot = require('./src/DiscordBot.js');
const Instance = new DiscordBot(require('./secret.json').token, 'tipgenerator.db');
Instance.login();


