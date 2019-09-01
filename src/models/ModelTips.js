const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.STRING,
		allowNull: false,
	},
    status: {
        type: Sql.ENUM('pending', 'approved'),
        allowNull: false,
        defaultValue: 'pending',
    },
    text: {
        type: Sql.TEXT,
        allowNull: false,
    },
    authorUrl: {
        type: Sql.STRING,
        allowNull: true,
    },
};