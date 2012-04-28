var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file", "utf8")
	//From the beginning of the file:
	//Writes "First line"
	.write ("First line")
	//Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
	.newLine ()
	//Writes "Second line"
	.write ("Second line")
	//Closes the writer. A flush is implicitly done.
	.close ();

//The BufferedWriter appends content to the end of the file because append == true
//From the end of the file:
new BufferedWriter ("file", "utf8", true)
	//Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
	.newLine ()
	//Writes "Third line"
	.write ("Third line")
	//Closes the writer. A flush is implicitly done.
	.close ();
	
//The file contains:
/*
	First line
	Second line
	Third line
*/