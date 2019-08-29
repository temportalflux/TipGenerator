const Sql = require('sequelize');

module.exports = {
    assetType: {
        type: Sql.ENUM('tip', 'background'),
        allowNull: false,
    },
};