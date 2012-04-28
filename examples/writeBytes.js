var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file").on ("error", function (error){
	console.log (error);
})
	//From the beginning of the file:
	.write ([0x00, 0x01, 0x02], 0, 3) //Writes 0x00, 0x01, 0x02
	.write (new Buffer ([0x03, 0x04]), 1, 1) //Writes 0x04
	.write (0x05) //Writes 0x05
	.close ();

//The BufferedWriter appends content to the end of the file because append == true
//From the end of the file:
new BufferedWriter ("file", true).write (0xFF).close (); //Writes 0xFF

//The file contains: 0x00, 0x01, 0x02, 0x04, 0x05, 0xFF