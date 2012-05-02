var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file")
	.on ("error", function (error){
		console.log (error);
	})
	
	//From the beginning of the file:
	.write ([0x00, 0x01, 0x02], 0, 3) //Writes 0x00, 0x01, 0x02
	.write (new Buffer ([0x03, 0x04]), 1, 1) //Writes 0x04
	.write (0x0506) //Writes 0x05, 0x06
	.close (); //Closes the writer. A flush is implicitly done.

//The BufferedWriter appends content to the end of the file because append == true
new BufferedWriter ("file", { append: true })
	.on ("error", function (error){
		console.log (error);
	})
	
	//From the end of the file:
	.write (0xFF) //Writes 0xFF
	.close (); //Closes the writer. A flush is implicitly done.

//The file contains: 0x00, 0x01, 0x02, 0x04, 0x05, 0x06, 0xFF