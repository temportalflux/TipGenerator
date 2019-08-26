module.exports = {
	command: 'approve <command>',
	desc: 'Approve pending entries from the submit command.',
	builder: (yargs) => yargs.commandDir('approve_cmds'),
	handler: (argv) => {},
};