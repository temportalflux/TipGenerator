const Sql = require('sequelize');
const { Utils } = require('discordbot-lib');

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
		set(value)
		{
			this.setDataValue('text', value);
			this.setDataValue('hash', Utils.Math.hashString(value));
		},
	},
	// TODO: Turn this into a json object with Name and Url fields
	authorUrl: {
		type: Sql.STRING,
		// TODO: TEMPORARY until all old data is backfilled with sources
		allowNull: true,
	},
	hash: {
		type: Sql.INTEGER,
		allowNull: false,
	},
};