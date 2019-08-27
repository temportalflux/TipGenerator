module.exports = {
    command: 'fetchRemote [reset]',
    desc: 'Fetch data from the remote files.',
    builder: {
		reset: {
			type: 'boolean',
			describe: 'Flag to indicate if database should be cleared',
			default: false,
		}
	},
    handler: async (argv) =>
    {
		if (argv.reset)
		{
			await argv.application.database.sync({force:true});
		}
		await argv.application.fetchRemoteFiles();
    },
};