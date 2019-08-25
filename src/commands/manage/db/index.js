module.exports = {
    drop: async (args, bot, msg) => {
        await bot.database.drop();
    },
    create: async (args, bot, msg) => {
        await bot.database.create();
    },
    getTables: async (args, bot, msg) => {
        const names = await bot.database.getTableNames();
        msg.reply(JSON.stringify(names));
    },
};