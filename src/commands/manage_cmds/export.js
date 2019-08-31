module.exports = {
	command: 'export <command>',
	desc: 'Export approved entries for category.',
	builder: (yargs) => yargs.commandDir('export_cmds'),
	handler: (argv) => {},
};