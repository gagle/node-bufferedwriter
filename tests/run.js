"use strict";

var Runner = require ("mocha-runner");

new Runner ({
	tests: ["buffered-writer.js"]
}).run (function (error){
	if (error) console.log (error);
});