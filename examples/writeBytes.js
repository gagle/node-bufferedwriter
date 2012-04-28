var BufferedWriter = require ("../build/buffered-writer");

//The BufferedWriter truncates the file because append == false
new BufferedWriter ("file")

//From the beginning of the file:
//Writes 0x00, 0x01, 0x02
.write ([0x00, 0x01, 0x02], 0, 3, function (error){
	if (error) return console.log (error);
	
	//Writes 0x04
	this.write (new Buffer ([0x03, 0x04]), 1, 1, function (error){
		if (error) return console.log (error);
		
		//Writes 0x05
		this.write (0x05, function (error){
			if (error) return console.log (error);
			
			//Closes the writer. A flush is implicitly done.
			this.close (function (error){
				if (error) return console.log (error);
				
				//The BufferedWriter appends content to the end of the file because append == true
				//From the end of the file:
				//Writes 0xFF
				new BufferedWriter ("file", true).write (0xFF, function (error){
					if (error) return console.log (error);
					
					//Closes the writer. A flush is implicitly done.
					this.close (function (error){
						if (error) console.log (error);
						
						//The file contains: 0x00, 0x01, 0x02, 0x04, 0x05, 0xFF
					});
				});
			});
		});
	});
});