const SaveFile = require('./SaveFile.js');

class Tips extends SaveFile
{
	
	constructor(filepath)
	{
		super(filepath);
	}

	getNextTip()
	{
		return 'your next tip ;)';
	}

}

module.exports = Tips;