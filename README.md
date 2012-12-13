buffered-writer
===============

_Node.js project_

#### Writes buffered data ####

Version: 0.2.3

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
	.write ("↑a", 1) //Writes: a (0x61)
	.close ();
```

#### Methods ####

When you call to `open()` a `Writer` instance is returned. This object inherits from `EventEmitter` and wraps a `WriteStream`. Only an `error` event is emitted. When this ocurrs, the `Writer` is closed automatically, you don't need to close it explicitly (if you try to do so you'll get another error, you cannot close twice).

- [bw.open(file[, settings])](#open)
- [Writer#close([callback])](#close)
- [Writer#line()](#line)
- [Writer#write(data[, offset[, length]])](#write)
- [Writer#writeln(data[, offset[, length]])](#writeln)

<a name="open"></a>
__bw.open(file[, settings])__  
Creates a `Writer` and opens a stream to the given file. If the file doesn't exist it is created. The possible settings are:

- bufferSize. _Number_. The buffer size. It must be greater than 0. Default is 16KB.
- encoding. _String_. The file encoding. Is only used when strings are written, that is, this parameter is ignored when arrays, numbers and buffers are written. Default is "utf8". Possible values are: "ascii", "utf8", "utf16le", "ucs2", "base64", "hex".
- append. _Boolean_. If true appends the data, if false the file is truncated. Default is false.
- mode. _Number_ | _String_. The file attributes. Default is 0644.
- start. _Number_. The offset to start writing data. Default is 0.

Returns the new `Writer` instance.

<a name="close"></a>
__Writer#close([callback])__  
Flushes the remaining data and closes the `Writer`. The callback doesn't receive any parameter.

<a name="flush"></a>
__Writer#flush(callback)__  
Flushes the current data. After the callback is executed it's safe to read back the written data, the data has been stored successfully. The callback doesn't receive any parameter.

This function is typically used when you need to ensure that the data is flushed to the disk at some point before closing the stream.

<a name="line"></a>
__Writer#line()__  
Writes a line, OS dependent, `\r\n` on Windows, `\n` otherwise.

Returns the `Writer` instance for chaining methods.

<a name="write"></a>
__Writer#write(data[, offset[, length]])__  
Writes data. It's not flushed to the underlying I/O layer, it's queued to a buffer and when it's full it's flushed to the disk.

The data can be a Number, String, Array or Buffer.
- Number. Is stored in big endian, e.g.: 0x0102  will be stored as [0x01, 0x02], 0x01 in a lower address.
- String. The `open()`'s encoding parameter is used.
- Array. An array of numbers. They are stored in the same order.
- Buffer. The Node.js built-in Buffer.

Returns the `Writer` instance for chaining methods.

<a name="writeln"></a>
__Writer#writeln(data[, offset[, length]])__  
Does the same as `write()` but stringifies the data and concatenates an EOL, OS dependent, `\r\n` on Windows, `\n` otherwise.

The offset and length specifies the slice of the given piece of data that will be written. By default offset is 0 and length is the last byte/character. The offset and length are applied to the string characters, not the bytes, for example, `write("↑a", 1)` will write `a` because offset is 1. Take into account that `↑` is encoded with 3 bytes in utf8.