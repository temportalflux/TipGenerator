const Table = require('./Table.js');

class TableBackgrounds extends Table
{

    getTableSchema()
	{
		return [
            {
                name: "id",
                type: "INTEGER",
                constraints: "PRIMARY KEY",
            },
            {
                name: "name",
                type: "TEXT",
                constraints: "NOT NULL DEFAULT \"\"",
            },
            {
                name: "url",
                type: "TEXT",
                constraints: "",
            },
        ];
	}

}

module.exports = TableBackgrounds;