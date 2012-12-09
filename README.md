buffered-writer
===============

_Node.js project_

#### Writes buffered data ####

Version: 0.2.0

When you need to write a file you typically write the content in little chunks at a time. To avoid multiple calls to the underlying I/O layer you need to use a piece of memory called "buffer", so instead of writting directly to the disk, you write to the buffer and when it is filled the content is written to disk. Doing this you win performance.

This library allows you to write files using internal buffers, so you don't have to worry about them.

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