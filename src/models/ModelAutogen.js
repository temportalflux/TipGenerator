const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.BIGINT,
		allowNull: false,
    },
    frequency: {
        type: Sql.INTEGER,
        allowNull: false,
    },
};