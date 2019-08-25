const Table = require('./Table.js');

class TableTips extends Table
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
                name: "text",
                type: "TEXT",
                constraints: "NOT NULL DEFAULT \"\"",
            },
            {
                name: "status",
                type: "TEXT",
                constraints: "NOT NULL DEFAULT \"pending\"",
            },
        ];
    }
    
    async addTipPending(text)
    {
        return await this.addRow(['text', 'status'], [`"${text}"`, '"pending"']);
    }

}

module.exports = TableTips;