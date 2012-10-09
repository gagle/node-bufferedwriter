var BufferedWriter = require ("../../build/buffered-writer");
var BinaryReader = require ("buffered-reader").BinaryReader;

var writeFile = function (file, cb){
	new BufferedWriter (file, { encoding: "utf8", bufferSize: 1 })
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
	new BinaryReader (file, { encoding: "utf8" })
		.read (11, function (error, bytes, bytesRead){
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