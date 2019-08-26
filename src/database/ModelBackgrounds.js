const Sql = require('sequelize');

module.exports = {
    name: {
        type: Sql.STRING,
        allowNull: false,
    },
    url: {
        type: Sql.STRING,
        allowNull: false,
    },
    status: {
        type: Sql.STRING,
        allowNull: false,
    },
};