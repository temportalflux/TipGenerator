
class Matcher
{

	constructor(list)
	{
		this.list = list;
	}

	execute(args)
	{
		if (args.length <= 0) return null;
		const matchedCommand = this.list[args[0]];
		if (matchedCommand != null)
		{
			const remainingArgs = args.slice(1);
			if (matchedCommand instanceof Matcher)
			{
				return matchedCommand.execute(remainingArgs);
			}
			else
			{
				return {
					func: matchedCommand,
					args: remainingArgs,
				};
			}
		}
		return null;
	}

}

module.exports = Matcher;