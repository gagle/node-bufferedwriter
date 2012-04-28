var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file", "utf8")

//From the beginning of the file:
//Writes "First line"
.write ("First line", function (error){
	if (error) console.log (error);
	
	//Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
	this.newLine (function (error){
		if (error) console.log (error);
		
		//Writes "Second line"
		this.write ("Second line", function (error){
			if (error) console.log (error);
			
			//Closes the writer. A flush is implicitly done.
			this.close (function (error){
				if (error) console.log (error);
				
				//The file contains:
				/*
					First line
					Second line
				*/
			});
		});
	});
});