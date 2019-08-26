module.exports = {
	command: 'manage <command>',
	desc: 'Commands used for managing the bot.',
	builder: (yargs) => yargs.commandDir('manage_cmds'),
	handler: (argv) => {},
};