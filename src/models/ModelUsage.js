const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.BIGINT,
		allowNull: false,
	},
    assetType: {
        type: Sql.ENUM('tip', 'background'),
        allowNull: false,
    },
};