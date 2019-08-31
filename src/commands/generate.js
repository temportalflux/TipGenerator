const lodash = require('lodash');
const Sql = require('sequelize');
const shortid = require('shortid');
// https://github.com/Automattic/node-canvas
const { createCanvas, loadImage } = require('canvas');
const Discord = require('discord.js');
const { Utils } = require('discordbot-lib');

/*
	takes a string and a maxWidth and splits the text into lines
	https://codereview.stackexchange.com/questions/16081/splitting-text-into-lines-from-a-max-width-value-for-canvas
*/
function fragmentText(ctx, text, maxWidth)
{

	var emmeasure = ctx.measureText("M").width;
	var spacemeasure = ctx.measureText(" ").width;

	if (maxWidth < emmeasure) // To prevent weird looping anamolies farther on.
		throw "Can't fragment less than one character.";

	if (ctx.measureText(text).width < maxWidth)
	{
		return [text];
	}

	var words = text.split(' '),
		metawords = [],
		lines = [];

	// measure first.
	for (var w in words)
	{
		var word = words[w];
		var measure = ctx.measureText(word).width;

		// Edge case - If the current word is too long for one line, break it into maximized pieces.
		if (measure > maxWidth)
		{
			// TODO - a divide and conquer method might be nicer.
			var edgewords = ((word, maxWidth) =>
			{
				var wlen = word.length;
				if (wlen == 0) return [];
				if (wlen == 1) return [word];

				var awords = [], cword = "", cmeasure = 0, letters = [];

				// Measure each letter.
				for (var l = 0; l < wlen; l++)
					letters.push({ "letter": word[l], "measure": ctx.measureText(word[l]).width });

				// Assemble the letters into words of maximized length.
				for (var ml in letters)
				{
					var metaletter = letters[ml];

					if (cmeasure + metaletter.measure > maxWidth)
					{
						awords.push({ "word": cword, "len": cword.length, "measure": cmeasure });
						cword = "";
						cmeasure = 0;
					}

					cword += metaletter.letter;
					cmeasure += metaletter.measure;
				}
				// there will always be one more word to push.
				awords.push({ "word": cword, "len": cword.length, "measure": cmeasure });
				return awords;
			})(word, maxWidth);

			// could use metawords = metawords.concat(edgwords)
			for (var ew in edgewords)
				metawords.push(edgewords[ew]);
		}
		else
		{
			metawords.push({ "word": word, "len": word.length, "measure": measure });
		}
	}

	// build array of lines second.
	var cline = "";
	var cmeasure = 0;
	for (var mw in metawords)
	{
		var metaword = metawords[mw];

		// If current word doesn't fit on current line, push the current line and start a new one.
		// Unless (edge-case): this is a new line and the current word is one character.
		if ((cmeasure + metaword.measure > maxWidth) && cmeasure > 0 && metaword.len > 1)
		{
			lines.push(cline)
			cline = "";
			cmeasure = 0;
		}

		cline += metaword.word;
		cmeasure += metaword.measure;

		// If there's room, append a space, else push the current line and start a new one.
		if (cmeasure + spacemeasure < maxWidth)
		{
			cline += " ";
			cmeasure += spacemeasure;
		} else
		{
			lines.push(cline)
			cline = "";
			cmeasure = 0;
		}
	}
	if (cmeasure > 0)
		lines.push(cline);

	return lines;
}

function drawText(ctx, canvas, canvasMargin, fontSize, posX, posY, txtArray)
{
	let longestText = txtArray.reduce((accum, line) => line.length > accum.length ? line : accum, "");

	const spaceBetweenLines = fontSize * 0.1;
	const textTotalHeight = txtArray.length * fontSize + (txtArray.length - 1) * spaceBetweenLines;
	posY -= textTotalHeight;
	posY += fontSize;

	ctx.fillStyle = "#00000077";
	ctx.fillRect(
		posX - (canvasMargin * 0.25),
		posY - (canvasMargin * 0.25) - fontSize,
		ctx.measureText(longestText).width + (canvasMargin * 0.5),
		textTotalHeight + canvasMargin * 0.5
	);

	ctx.fillStyle = "#FFFFFFFF";
	txtArray.forEach((line, i) =>
	{
		ctx.fillText(line, posX, posY + (i * (fontSize + spaceBetweenLines)));
	});
}

async function generateTipImageAttachment(backgroundUrl, tipText)
{
	const tipBackground = await loadImage(backgroundUrl);
	const dndlogo = await loadImage('./assets/dnd-logo.png');

	const canvas = createCanvas(tipBackground.width, tipBackground.height);
	const ctx = canvas.getContext('2d');

	const canvasMargin = canvas.width * 0.03;

	// Draw the background
	ctx.drawImage(tipBackground, 0, 0, canvas.width, canvas.height);

	// Draw DnD Logo
	const dndlogoWidth = canvas.width * 0.1;
	const dndlogoHeight = dndlogoWidth * (canvas.height / canvas.width);
	const dndlogoPosX = canvas.width - dndlogoWidth - canvasMargin;
	ctx.drawImage(dndlogo,
		dndlogoPosX, canvas.height - dndlogoHeight - canvasMargin,
		dndlogoWidth, dndlogoHeight
	);

	// Draw LOADING...
	{
		const fontSize = canvas.width * 0.025;
		ctx.font = `${Math.max(fontSize, 10)}px ${'DnD'}`;
		const posX = canvasMargin;
		const posY = canvasMargin + fontSize * 0.8;
		//ctx.font = `${Math.max(fontSize, 10)}px ${'DnD'}`;
		//ctx.fillText('LOADING . . .', posX, posY);
		drawText(ctx, canvas, canvasMargin, fontSize, posX, posY, ['LOADING . . .']);
	}

	// Draw tip
	{
		const fontSize = canvas.width * 0.05;
		ctx.font = `${Math.max(fontSize, 10)}px ${'DnD'}`;
		const posX = canvasMargin;
		let txtArray = fragmentText(ctx, tipText, dndlogoPosX - canvasMargin);
		drawText(ctx, canvas, canvasMargin, fontSize, posX, canvas.height - canvasMargin, txtArray);
	}

	return {
		attachment: canvas.createJPEGStream(),
		name: `${shortid.generate()}.jpg`,
	};
}

async function getAvailable(Usage, Model, modelToId)
{
	const recentlyUsedModels = await Usage.findAll({
		where: {
			assetType: { [Sql.Op.eq]: Model.getTableName() }
		}
	});
	var recentlyUsedIds = [];
	for (model of recentlyUsedModels)
	{
		const otherModel = await modelToId(model);
		recentlyUsedIds.push(otherModel.get('id'));
	}
	const availableModels = await Model.findAll({
		where: {
			id: { [Sql.Op.notIn]: recentlyUsedIds }
		}
	});
	if (availableModels.length <= 0)
	{
		await Usage.destroy({
			where: {
				assetType: {
					[Sql.Op.eq]: Model.getTableName()
				}
			}
		});
		return await Model.findAll();
	}
	return availableModels;
}

module.exports = {
	command: 'generate [trackUsage]',
	desc: 'Generate a tip with image.',
	builder: {
		trackUsage: {
			type: 'boolean',
			describe: 'Flag marking if generating will track the usage of a tip and background',
			default: false,
		}
	},
	handler: async (argv) =>
	{
		if (!argv.message.guild.available) { return; }

		const Usage = argv.application.Usage;

		const Background = argv.application.Background;
		const Tip = argv.application.Tip;

		const backgrounds = await getAvailable(
			Usage, Background,
			async (usageInst) => await usageInst.getBackground()
		);
		const tips = await getAvailable(
			Usage, Tip,
			async (usageInst) => await usageInst.getTip()
		);

		const background = Utils.Math.pickRandom(backgrounds);
		const tip = Utils.Math.pickRandom(tips);

		await argv.message.channel.send(
			tip.get('text'),
			{
				files: [
					await generateTipImageAttachment(
						background.get('url'),
						tip.get('text')
					)
				]
			}
		);

		const Creation = argv.application.Creation;
		const creation = await Creation.create({
			guild: argv.message.guild.id,
		});
		await creation.setTip(tip);
		await creation.setBackground(background);

		if (argv.trackUsage)
		{
			const usageTip = await Usage.create({
				guild: argv.message.guild.id,
				assetType: Tip.getTableName(),
			});
			await usageTip.setCreation(creation);
			await usageTip.setTip(tip);

			const usageBkgd = await Usage.create({
				guild: argv.message.guild.id,
				assetType: Background.getTableName(),
			});
			await usageBkgd.setCreation(creation);
			await usageBkgd.setBackground(background);
		}

	},
};