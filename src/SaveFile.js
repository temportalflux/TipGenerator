const fs = require('fs');
const { promisify } = require('util');

const fileAccess = promisify(fs.access);
const fileWrite = promisify(fs.writeFile);
const fileRead = promisify(fs.readFile);

class SaveFile
{

	constructor(filepath)
	{
		this.filepath = filepath;
		this.cache = this.getDefaultData();
	}

	getDefaultData()
	{
		return {};
	}

	async load()
	{
		try {
			await fileAccess(this.filepath,
				fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
			);
			const data = await fileRead(this.filepath);
			this.cache = JSON.parse(data);
		}
		catch (e)
		{
			switch (e.code)
			{
				case 'ENOENT':
					console.log(`Creating file ${this.filepath}`);
					await this.save();
					break;
				default:
					console.error(e);
					break;
			}
		}
	}

	has(key)
	{
		return this.cache.hasOwnProperty(key);
	}

	get(key)
	{
		return this.cache[key];
	}

	set(key, value)
	{
		this.cache[key] = value;
	}

	stringify()
	{
		return JSON.stringify(this.cache, null, 2);
	}

	async save()
	{
		try {
			await fileWrite(this.filepath, this.stringify());
		}
		catch (e)
		{
			console.error(e);
		}
	}

}

module.exports = SaveFile;