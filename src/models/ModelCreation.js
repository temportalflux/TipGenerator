const Sql = require('sequelize');

module.exports = {
	guild: {
		type: Sql.STRING,
		allowNull: false,
	},
};