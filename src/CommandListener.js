const Matcher = require('./commands/matcher.js');
const lodash = require('lodash');

class CommandListener
{

    constructor(options)
    {
        lodash.assignIn(this, options);
        this.commandsMatcher = new Matcher(this.list);
    }

	parseArguments(argumentString)
	{
		return argumentString.split(new RegExp('(".*?")', 'g')).reduce((accum, param) => {
			if (param)
			{
				const stringMatch = param.match('"(.*)"');
				if (stringMatch != null)
				{
					accum.push(stringMatch[1]);
					return accum;
				}
				else
				{
					return param.trim().split(' ').reduce((accum, entry) => {
						if (entry) return accum.concat(entry);
						else return accum;
					}, accum);
				}
			}
			return accum;
		}, []);
	}

	async processMessage(text)
	{
		const match = text.match(new RegExp(`!${this.prefix} (.+)`));
		if (match !== null)
		{
            const args = this.parseArguments(match[1]);
            const matched = this.commandsMatcher.execute(args);
            if (matched !== null)
            {
                // TODO: Re-enable commands, but make sure args reflect that the APPLICATION is being passed, not the BOT
                // await matched.func(matched.args, this, msg);
            }
        }
        
	}

}

module.exports = CommandListener;