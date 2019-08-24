const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const lodash = require('lodash');

const fetch = promisify(request.get);
const fileAccess = promisify(fs.access);
const fileWrite = promisify(fs.writeFile);
const fileRead = promisify(fs.readFile);

class SaveFile
{

	constructor(filepath, remoteSource)
	{
		this.filepath = filepath;
		this.remoteSource = remoteSource;
		this.cache = this.getDefaultData();
	}

	getDefaultData()
	{
		return {};
	}

	async download(url)
	{
		return await fetch(url);
	}

	async exists(path)
	{
		try
		{
			await fileAccess(this.filepath,
				fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
			);
			return true;
		}
		catch (e)
		{
			switch (e.code)
			{
				case 'ENOENT':
					break;
				default:
					console.error(e);
					break;
			}
			return false;
		}
	}

	async load()
	{
		this.cache = {};
		
		const exists = await this.exists(this.filepath);
		if (exists)
		{
			const data = await fileRead(this.filepath);
			this.cache = JSON.parse(data);
		}

		try
		{
			const {statusCode, body} = await this.download(this.remoteSource);
			switch (statusCode)
			{
				case 200:
					const remoteData = JSON.parse(body);
					lodash.assign(this.cache, remoteData);
					break;
				default:
					console.log(`WARNING Could not laod remote source ${this.remoteSource}, received status code ${statusCode}.`);
					break;
			}
		}
		catch (e)
		{
			console.error(e);
		}
		
		lodash.merge(this.cache, this.getDefaultData());
		this.save();
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