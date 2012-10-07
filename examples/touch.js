var BufferedWriter = require ("../build/buffered-writer");

new BufferedWriter ("file")
	.on ("error", function (error){
		console.log (error);
	})
	
	.write ("some data")
	.close (function (){
		//The file contains: "some data"
		
		new BufferedWriter ("file", { append: true })
			.on ("error", function (error){
				console.log (error);
			})
			
			.touch () //Truncates the file to zero length, no matter if the settings are configured to append
			.write ("test")
			.touch ().touch () //No operation because the file is already opened
			.close (); //The file contains: "test"
	});