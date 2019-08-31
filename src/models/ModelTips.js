const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.BIGINT,
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
        unique: true,
    },
    authorUrl: {
        type: Sql.STRING,
        allowNull: false,
    },
};