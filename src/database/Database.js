const sqlite = require('sqlite3');
const lodash = require('lodash');

class Database
{

    constructor(fileName, tables)
    {
        this.fileName = fileName;
        this.db = new sqlite.Database(this.fileName);
        this.tables = lodash.mapValues(tables, (value, key) => value.init(this, key));
    }

	async run(sqlQuery, params=[])
	{
		// https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
		return await new Promise((resolve, reject) => {
			this.db.run(sqlQuery, params, (err) => {
				if (err === null) resolve();
				else reject(err);
			});
		});
    }

	async all(sqlQuery, params=[])
	{
		// https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
		return await new Promise((resolve, reject) => {
			this.db.all(sqlQuery, params, (err, result) => {
				if (err === null) resolve(result);
				else reject(err);
			});
		});
    }
    
    async getTableNames()
    {
        try
        {
            const result = await this.all(`SELECT name FROM sqlite_master WHERE type='table';`);
            return result.map((entry) => entry.name);
        }
        catch(e)
        {
            console.error(e);
        }
    }

    async drop()
    {
        const tableNames = lodash.keys(this.tables);
        for (const tableName of tableNames)
        {
            await this.tables[tableName].drop();
        }
    }

    async create()
    {
        const tableNames = lodash.keys(this.tables);
        for (const tableName of tableNames)
        {
            await this.tables[tableName].create();
        }
    }

}

module.exports = Database;