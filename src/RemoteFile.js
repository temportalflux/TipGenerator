const { promisify } = require('util');
const request = require('request');

const fetch = promisify(request.get);

class RemoteFile
{

	constructor(remoteSource)
	{
		this.remoteSource = remoteSource;
	}
    
    async get()
	{
		const {statusCode, body} = await fetch(this.remoteSource);
        switch (statusCode)
        {
            case 200:
                return body;
            default:
                throw new Error(`Could not load remote source ${this.remoteSource}, received status code ${statusCode}.`);
        }
    }

}

module.exports = RemoteFile;