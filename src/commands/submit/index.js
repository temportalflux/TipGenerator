const lodash = require('lodash');

module.exports = {
    "tip": async (args, bot, msg) =>
    {
        if (args.length <= 0)
        {
            await msg.channel.send("You did not specify an entry to be added.");
            return;
        }

        bot.database.models.tips.create({
            status: 'pending',
            text: args.shift(),
        });

        await msg.reply("Your entry is pending approval by someone with manager privleges.");
    },
    "art": async (args, bot, msg) =>
    {
        if (args.length <= 0)
        {
            await msg.reply("You need to name your submission, and it must have an extension.");
            return;
        }

        const entryFilename = args.shift();

        const attachmentList = lodash.toPairs(msg.attachments);
        // Cannot have more than 1 image in an upload
        if (attachmentList.length >= 2)
        {
            await msg.reply("We do not currently support submitting more than 1 entry at a time, sorry. Please provide only 1 image.");
            return;
        }

        // No attachment, must have link
        if (attachmentList.length <= 0)
        {
            if (args.length <= 0)
            {
                await msg.reply("If you do not attach an image, you must provide a link to the art.");
                return;
            }

            const extension = path.extname(entryFilename);
            const extName = extension.slice(1);
            const validExtensions = ['png', 'jpg'];
            if (!validExtensions.includes(extName))
            {
                await msg.channel.send(`Your submission has an invalid file extension (${extName}), it must be either: ${validExtensions.reduce((accum, ext) => `${accum} ${ext},`).slice(1, -1)}.`);
                return;
            }
            const filename = path.basename(entryFilename, extension);
            if (!filename)
            {
                await msg.channel.send("Your submission has an empty file name.");
                return;
            }

            bot.database.models.backgrounds.create({
                status: 'pending',
                name: entryFilename,
                url: args.shift(),
            });
        }
        // 1 attachment, use it
        else
        {
            const attachment = attachmentList.shift()[1];
            bot.database.models.backgrounds.create({
                status: 'pending',
                name: attachment.filename,
                url: attachment.url,
            });
        }

        await msg.reply("Your entry is pending approval by someone with manager privleges.");
    },
};