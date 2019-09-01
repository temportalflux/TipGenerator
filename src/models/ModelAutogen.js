const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.STRING,
		allowNull: false,
    },
    channel: {
        type: Sql.STRING,
        allowNull: false,
    },
    startDate: {
        type: Sql.DATE,
        allowNull: false,
    },
    frequency: {
        type: Sql.INTEGER,
        allowNull: false,
    },
    nextGeneration: {
        type: Sql.DATE,
        allowNull: false,
    },
};