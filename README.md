buffered-writer
===============

_Node.js project_

#### Writes buffered data ####

Version: 0.2.1

Node.js streams are not buffered, that is, when you write data to them you're doing multiple I/O calls. This module buffers the data that has to be written to disk and eases the buffer manipulation when you need to write data from different nature (strings, numbers, arrays or buffers).

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

When you call to `open()` a stream a `Writer` instance is returned. This object inherits from `EventEmitter` and wraps a `WriteStream`. Only an `error` event is emitted. When this ocurrs, the `Writer` is closed automatically, you don't need to close it explicitly (if you try to do so you'll get another error, you cannot close twice).

- [bw.open(file[, settings])](#open)
- [Writer#close([callback])](#close)
- [Writer#line()](#line)
- [Writer#write(buffer[, offset[, length]])](#write)

<a name="open"></a>
__bw.open(file[, settings])__  


<a name="close"></a>
__Writer#close([callback])__  


<a name="line"></a>
__Writer#line()__  


<a name="write"></a>
__Writer#write(buffer[, offset[, length]])__  
