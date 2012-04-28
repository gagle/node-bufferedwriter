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
				
				//The BufferedWriter appends content to the end of the file because append == true
				//From the end of the file:
				//Writes EOL (OS dependent; \r\n on Windows, otherwise \n)
				new BufferedWriter ("file", "utf8", true).newLine (function (error){
					if (error) console.log (error);
					
					//Writes "Third line"
					this.write ("Third line", function (error){
						if (error) console.log (error);
						
						//Closes the writer. A flush is implicitly done.
						this.close (function (error){
							if (error) console.log (error);
							
							//The file contains:
							/*
								First line
								Second line
								Third line
							*/
						});
					});
				});
			});
		});
	});
});