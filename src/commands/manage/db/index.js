module.exports = {
    sync: async (args, bot, msg) => {
        await bot.database.sync();
    },
};