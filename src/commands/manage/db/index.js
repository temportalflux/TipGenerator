module.exports = {
    reset: async (args, bot, msg) => {
        await bot.database.sync({ force: true });
    },
};