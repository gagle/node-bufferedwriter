buffered-writer
===============

_Node.js project_

#### Writes buffered data ####

Version: 0.2.0

Node.js streams are not buffered, that is, when you write data to it you're doing an I/O call. This module buffers the data that has to be written to disk and eases the buffer manipulation when you need to write data from different nature (strings, numbers, arrays or buffers).

#### Installation ####

```
npm install buffered-writer
```

#### Example ####

```javascript
var bw = require ("buffered-writer");

bw.open ("file")
	.on ("error", function (error){
		console.log (error);
	})
	.write ([0x00, 0x01, 0x02]) //Writes: 0x00, 0x01, 0x02
	.write (new Buffer ([0x03, 0x04]), 1, 1) //Writes: 0x04
	.write (0x0506) //Writes: 0x05, 0x06
	.write ("a↑b", 1) //Writes: ↑ (0xe2, 0x86, 0x91)
	.close ();
```

#### Methods ####

todo