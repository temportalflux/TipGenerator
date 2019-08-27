const lodash = require('lodash');
const yargs = require('yargs');
//const Matcher = require('./commands/matcher.js');

class CommandListener
{

	constructor(options)
	{
		lodash.assignIn(this, options);
		//this.commandsMatcher = new Matcher(this.list);
		this.parser = yargs
			.commandDir('commands')
			/*
			.command('test <name> <url> [force] [counter]', 'test the yargs system', (yargs) => yargs
				.positional('name', {
					type: 'string',
					describe: 'The filename of the background image.',
					demandOption: true,
				})
				.positional('url', {
					type: 'string',
					describe: 'The url of the background image.',
					demandOption: true,
				})
				.option('force', {
					type: 'boolean',
					describe: 'A force variable.',
					default: false,
				})
				.option('counter', {
					type: 'integer',
					describe: 'some int counter',
					default: 0,
				}),
				(argv) => console.log('Executing this test command with args:', argv)
			)
			//*/
			;
	}

	parsePotentialString(wrappedStr, regex)
	{
		const stringMatch = wrappedStr.match(new RegExp(regex));
		return stringMatch != null ? stringMatch[1] : wrappedStr;
	}

	parseParam({ ordered, named }, param)
	{
		console.log('Parsing param:', param);

		const stringMatch = param.match(new RegExp(/^"(.*?)"/));
		console.log('Found string:', stringMatch == null ? null : stringMatch[1]);
		if (stringMatch !== null)
		{
			ordered.push(stringMatch[1]);
			return;
		}

		const keyStringMatch = param.match(new RegExp(/(.*?)([^\s]*)\="(.*?)"(.*?)/));
		console.log('Found key with string value:', keyStringMatch);
		if (keyStringMatch !== null)
		{
			named[keyStringMatch[2]] = keyStringMatch[3];
			if (keyStringMatch[1])
				this.parseParam({ ordered, named }, keyStringMatch[1].trim());
			if (keyStringMatch[4])
				this.parseParam({ ordered, named }, keyStringMatch[4].trim());
			return;
		}

		const settingsMatch = param.match(new RegExp(/(.*?)--(.*)(.*?)/));
		console.log('Found settings param:', settingsMatch);
		if (settingsMatch !== null)
		{
			console.log(settingsMatch);
			named[settingsMatch[2].trim()] = true;
			if (settingsMatch[1])
				this.parseParam({ ordered, named }, settingsMatch[1].trim());
			if (settingsMatch[4])
				this.parseParam({ ordered, named }, settingsMatch[4].trim());
			return;
		}

		const otherArgs = param.trim().split(' ');
		console.log('Found ordered args:', otherArgs);
		otherArgs.forEach((otherArg) =>
		{
			ordered.push(otherArg);
		});
		return { ordered, named };
	}

	parseArguments(argumentString)
	{
		return {};
		const stringargs = argumentString.split(new RegExp(/(?<=\s)(".*?")/));
		console.log(stringargs);
		return stringargs.reduce(({ ordered, named }, param) =>
		{
			if (param)
			{
				this.parseParam({ ordered, named }, param);
			}
			return { ordered, named };
		}, { ordered: [], named: {} })/*.reduce(({ ordered, named }, param) =>
		{
			console.log(param);
			const matchNamedParam = param.match(new RegExp('([^\s]*)=(.*)'));
			const settingsParam = param.match(new RegExp('--(.*)'));
			if (matchNamedParam != null)
			{
				named[matchNamedParam[1]] = this.parsePotentialString(matchNamedParam[2], /"([^"]*?)"/);
			}
			else if (settingsParam != null)
			{
				named[settingsParam[1]] = true;
			}
			else
			{
				ordered.push(param);
			}
			return { ordered, named };
		}, { ordered: [], named: {} })*/;
	}

	async parseCommand(text, msg)
	{
		return new Promise((resolve, reject) =>
		{
			this.parser.parse(text, { application: this.application, message: msg }, (err, argv, output) =>
			{
				if (err) reject(err, argv, output);
				else resolve(argv, output);
			});
		});
	}

	async processMessage(msg)
	{
		const match = msg.content.match(new RegExp(`!${this.prefix} (.+)`));
		if (match !== null)
		{
			try
			{
				const result = await this.parseCommand(match[1], msg);
			}
			catch(error)
			{
                if (error.name === 'YError')
                    await msg.reply(error.message);
				console.log(error);
			}
			/*
			const args = this.parseArguments(match[1]);
			console.log(args);
			const matched = null;//this.commandsMatcher.execute(args.ordered, args.named);
			if (matched !== null)
			{
				console.log('TODO Execute command', matched);
				// TODO: Re-enable commands, but make sure args reflect that the APPLICATION is being passed, not the BOT
				// await matched.func(matched.args, this, msg);
			}
		//*/
		}
	}

}

module.exports = CommandListener;