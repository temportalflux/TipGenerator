'use strict';

const open = require("open");
(async() => {
	await open(process.argv[2]);
})

