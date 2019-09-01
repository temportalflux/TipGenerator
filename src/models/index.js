module.exports = {
	tip: { attributes: require('./ModelTips.js') },
	background: { attributes: require('./ModelBackgrounds.js') },
	usage: { attributes: require('./ModelUsage.js'), options: { timestamps: true } },
	creation: { attributes: require('./ModelCreation.js'), options: { timestamps: true } },
	autogen: { attributes: require('./ModelAutogen.js') },
};
