const Sql = require('sequelize');

module.exports = {
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
};