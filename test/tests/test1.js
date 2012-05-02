var BufferedWriter = require ("../../build/buffered-writer");
var BufferedReader = require ("buffered-reader");

var writeFile = function (file, cb){
	new BufferedWriter (file, { encoding: "utf8" })
		.on ("error", function (error){
			cb (error);
		})
		
		.write ("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
		.newLine ()
		.write ("Morbi convallis nibh massa, eu varius felis.")
		.close (function (){
			cb (null);
		});
};

var readFile = function (file, cb){
	new BufferedReader (file, { encoding: "utf8" })
		.readBytes (11, function (error, bytes, bytesRead){
			if (error) return cb (error);
			
			console.log (bytes.toString ());
			this.close (function (error){
				cb (error);
			});
		})
};

var file = "tmp";
writeFile (file, function (error){
	if (error) return console.log (error);
	readFile (file, function (error){
		if (error) console.log (error);
	});
});