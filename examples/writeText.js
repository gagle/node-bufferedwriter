var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file", "utf8")
	.on ("error", function (error){
		console.log (error);
	})
	
	//From the beginning of the file:
	.write ("First line") //Writes "First line"
	.newLine () //Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
	.write ("Second line") //Writes "Second line"
	.close (); //Closes the writer. A flush is implicitly done.

//The BufferedWriter appends content to the end of the file because append == true
new BufferedWriter ("file", "utf8", true)
	.on ("error", function (error){
		console.log (error);
	})
	
	//From the end of the file:
	.newLine () //Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
	.write ("Third line") //Writes "Third line"
	.close (); //Closes the writer. A flush is implicitly done.
	
//The file contains:
/*
	First line
	Second line
	Third line
*/