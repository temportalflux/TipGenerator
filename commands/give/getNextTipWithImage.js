const Discord = require('discord.js');
const { createCanvas, loadImage } = require('canvas')
/*
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

// Draw cat with lime helmet
loadImage('examples/images/lime-cat.jpg').then((image) => {
  ctx.drawImage(image, 50, 0, 70, 70)

  console.log('<img src="' + canvas.toDataURL() + '" />')
})
//*/


module.exports = async (args, bot, msg) => {
	const image = await loadImage('./Backgrounds/0.jpg');
	
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext('2d');

	// Draw the background
	ctx.drawImage(image, 0, 0, image.width, image.height);
	
	const tip = bot.tips.getNextTip();

	await msg.channel.send(tip, {
		files: [{
			attachment: canvas.createJPEGStream(),
			name: "0.jpg",
		}]
	});
	console.log(`Sent tip "${tip}" with generated image to "${msg.guild.name}"(${msg.guild.id})-"${msg.channel.name}".`);
};