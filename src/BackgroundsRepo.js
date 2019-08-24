const AssetRepo = require('./AssetRepo.js');
const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const path = require('path');

const requestHead = promisify(request.head);
const rmdir = promisify(require('rimraf'));
const mkdir = promisify(fs.mkdir);

async function download(uri, filepath)
{
}

class BackgroundsRepo extends AssetRepo
{

	constructor(filepath, directory)
	{
		super(filepath);
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
			let stream = await request(entry.url).pipe(fs.createWriteStream(this.getPathForEntry(entry.name)));
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
			await rmdir(this.directory);
			await mkdir(this.directory);
			for (let entry of this.getApprovedList())
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