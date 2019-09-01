const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.STRING,
		allowNull: false,
	},
    status: {
        type: Sql.ENUM('pending', 'approved'),
        allowNull: false,
    },
    name: {
        type: Sql.TEXT,
        allowNull: false,
    },
    url: {
        type: Sql.STRING,
        allowNull: false,
    },
    authorUrl: {
        type: Sql.STRING,
        allowNull: true,
    },
};