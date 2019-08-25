
class Table
{

	init(database, name)
	{
		this.database = database;
		this.name = name;
		return this;
	}

	getTableSchema()
	{
		return [];
	}

	async create()
	{
		try
		{
			const columnSchema = this.getTableSchema().reduce((accum, entry) => `${accum ? `${accum},` : ""}${entry.name} ${entry.type} ${entry.constraints}`, "");
			await this.database.run(`CREATE TABLE IF NOT EXISTS ${this.name} (${columnSchema});`);
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async drop()
	{
		try
		{
			await this.database.run(`DROP TABLE IF EXISTS ${this.name};`);
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async addRows(columnNames, arrayOfFields)
	{
		const arrayToString = (array) => array.reduce((accum, value) => `${accum} ${value},`, "").slice(1, -1);
		try
		{
			console.log(`INSERT INTO ${this.name} (${arrayToString(columnNames)}) VALUES ${arrayOfFields.reduce(
				(accum, fields) => `${accum} (${arrayToString(fields)}),`
			, "").slice(1, -1)};`);
			//await this.database.run(`INSERT INTO ${this.name} (${arrayToString(columnNames)}) VALUES ${arrayOfFields.reduce(
			//	(accum, fields) => `${accum} (${arrayToString(fields)}),`
			//, "").slice(1, -1)};`);
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async addRow(columnNames, fields)
	{
		return await this.addRows(columnNames, [fields]);
	}

}

module.exports = Table;