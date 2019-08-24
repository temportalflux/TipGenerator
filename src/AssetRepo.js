const SaveFile = require('./SaveFile.js');
const lodash = require('lodash');

class AssetRepo extends SaveFile
{
	
	constructor(filepath)
	{
		super(filepath);
	}

	getDefaultData()
	{
		return {
			pending: [],
			approved: [],
			usedRecently: [],
		};
	}

	async clone()
	{
	}

	addToList(category, entry)
	{
		let list = this.get(category);
		list.push(entry);
		this.set(category, list);
	}

	removeFromList(category, index)
	{
		let list = this.get(category);
		const value = list[index];
		list.splice(index);
		this.set(category, list);
		return value;
	}

	clear(category)
	{
		this.set(category, []);
	}

	getPendingList()
	{
		return this.get('pending');
	}

	getApprovedList()
	{
		return this.get('approved');
	}

	getUsedRecentlyList()
	{
		return this.get('usedRecently');
	}

	addPending(entry)
	{
		this.addToList('pending', entry);
	}

	addApproved(entry)
	{
		this.addToList('approved', entry);
	}

	addUsedRecently(entry)
	{
		this.addToList('usedRecently', entry);
	}

	getCount(category)
	{
		return this.has(category) ? this.get(category).length : -1;
	}

	getPendingCount()
	{
		return this.getPendingList().length;
	}

	getApprovedCount()
	{
		return this.getApprovedList().length;
	}

	getPending(index)
	{
		return this.getPendingList()[index];
	}

	getApproved(index)
	{
		return this.getApprovedList()[index];
	}

	removePending(index)
	{
		return this.removeFromList('pending', index);
	}

	removeApproved(index)
	{
		return this.removeFromList('approved', index);
	}

	clearUsedRecently()
	{
		this.clear('usedRecently');
	}

	approvePending(index)
	{
		if (index === undefined)
		{
			this.getPendingList().forEach((entry) => {
				this.addApproved(entry);
			});
			this.set('pending', []);
		}
		else
		{
			const entry = this.removePending(index);
			this.addApproved(entry);
			return entry;
		}
	}

	makeStringFromEntry(entry)
	{
		return entry;
	}

	getNextEntry()
	{
		const approved = this.getApprovedList();
		if (approved.length <= 0)
		{
			return undefined;
		}
		const usedRecently = this.getUsedRecentlyList();
		let available = lodash.difference(approved, usedRecently);
		if (available.length <= 0)
		{
			available = approved;
			this.clearUsedRecently();
		}
		const nextEntry = available[Math.floor(Math.random() * available.length)];
		this.addUsedRecently(nextEntry);
		this.save();
		return nextEntry;
	}

}

module.exports = AssetRepo;