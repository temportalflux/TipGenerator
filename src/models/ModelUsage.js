const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.STRING,
		allowNull: false,
	},
	assetType: {
		type: Sql.ENUM('tip', 'background'),
		allowNull: false,
	},
};