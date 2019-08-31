module.exports = {
	command: 'list <command>',
	desc: 'List entries in the bot for this server.',
	builder: (yargs) => yargs.commandDir('list_cmds'),
	handler: (argv) => {},
};