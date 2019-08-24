const AssetRepo = require('./AssetRepo.js');
const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const path = require('path');
const rimraf = require('rimraf');

const rmdir = (path) => new Promise((resolve, reject) => {
	rimraf(path, () => { resolve(); });
});
const mkdir = promisify(fs.mkdir);

class BackgroundsRepo extends AssetRepo
{

	constructor(filepath, remoteSource, directory)
	{
		super(filepath, remoteSource);
		this.directory = directory;
	}

	getPathForEntry(entry)
	{
		return path.join(this.directory, entry.name);
	}

	async downloadEntry(entry)
	{
		try
		{
			let stream = await request(entry.url).pipe(fs.createWriteStream(this.getPathForEntry(entry)));
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async wipe()
	{
		try
		{
			if (await this.exists(this.directory))
			{
				await rmdir(this.directory);
			}
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async clone()
	{
		try
		{
			await mkdir(this.directory);
			for (const entry of this.getApprovedList())
			{
				await this.downloadEntry(entry);
			}
		}
		catch (e)
		{
			console.error(e);
		}
	}

	makeStringFromEntry(entry)
	{
		return `${entry.name} (${entry.url})`;
	}

	addApproved(entry)
	{
		super.addApproved(entry);
		this.downloadEntry(entry);
	}

	getNextEntry()
	{
		return this.getPathForEntry(super.getNextEntry());
	}

}

module.exports = BackgroundsRepo;