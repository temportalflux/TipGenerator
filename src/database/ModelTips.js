const Sql = require('sequelize');

module.exports = {
    text: {
        type: Sql.STRING,
        allowNull: false,
    },
    status: {
        type: Sql.STRING,
        allowNull: false,
    },
};