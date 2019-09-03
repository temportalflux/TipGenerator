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
		// TODO: Turn this into a json object with Name and Url fields
    authorUrl: {
        type: Sql.STRING,
				// TODO: TEMPORARY until all old data is backfilled with sources
        allowNull: true,
    },
};