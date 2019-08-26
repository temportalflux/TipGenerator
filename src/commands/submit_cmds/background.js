const lodash = require('lodash');
const path = require('path');

module.exports = {
	command: 'background <name> [url]',
	desc: 'Submit a background to be added to the generator.',
	builder: (yargs) => yargs,//.help(),
	handler: async (argv) =>
	{
		const attachmentList = lodash.toPairs(argv.message.attachments);
		// Cannot have more than 1 image in an upload
		if (attachmentList.length >= 2)
		{
				await argv.message.reply("We do not currently support submitting more than 1 entry at a time, sorry. Please provide only 1 image.");
				return;
		}

		// No attachment, must have link
		if (attachmentList.length <= 0)
		{
				if (!argv.url)
				{
						await argv.message.reply("If you do not attach an image, you must provide a link to the art.");
						return;
				}

				const extension = path.extname(argv.name);
				const extName = extension.slice(1);
				const validExtensions = ['png', 'jpg'];
				if (!validExtensions.includes(extName))
				{
						await argv.message.channel.send(`Your submission has an invalid file extension (${extName}), it must be either: ${validExtensions.reduce((accum, ext) => `${accum} ${ext},`).slice(1, -1)}.`);
						return;
				}
				const filename = path.basename(argv.name, extension);
				if (!filename)
				{
						await argv.message.channel.send("Your submission has an empty file name.");
						return;
				}

				argv.application.Background.create({
						status: 'pending',
						name: argv.name,
						url: argv.url,
				});
		}
		// 1 attachment, use it
		else
		{
				const attachment = attachmentList.shift()[1];
				argv.application.Background.create({
						status: 'pending',
						name: attachment.filename,
						url: attachment.url,
				});
		}

		await argv.message.reply("Your entry is pending approval by someone with manager privleges.");
	},
};