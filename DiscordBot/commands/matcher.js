module.exports = (commandList, arguments) => {
	if (commandList[arguments[0]] != null)
	{
		return commandList[arguments[0]](arguments);
	}
	return null;
};