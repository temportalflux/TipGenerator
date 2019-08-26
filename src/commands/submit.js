module.exports = {
	command: 'submit <command>',
	desc: 'Submit items to include in random generators.',
	builder: (yargs) => yargs.commandDir('submit_cmds'),
	handler: (argv) => {},
};