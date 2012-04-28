<a name="start"></a>

Node BufferedWriter
===================

#### Fully configurable buffered writer for node.js ####

[Availability](#availability) | [Compatibility](#compatibility) | [Documentation](#documentation)

Version: 0.0.1

When you need to write a file you typically write the content in little chunks at a time. To avoid multiple calls to the underlying I/O layer you need to use a piece of memory called "buffer", so instead of writting directly to the disk, you write to the buffer and when it is filled the content is written to disk. Doing this you win performance.

This library allows you to write files using internal buffers, so you don't have to worry about them.

<a name="availability"></a>
#### Availability [↑](#start) ####

Via npm:

```
npm install buffered-writer
```

Or simply copying `build/buffered-writer.js` into your project's directory and `require()` accordingly.

***

<a name="compatibility"></a>
#### Compatibility [↑](#start) ####

✔ Node *

***

<a name="documentation"></a>
#### Documentation [↑](#start) ####
 
[Reference](https://github.com/Gagle/Node-BufferedWriter/wiki/Reference)  
[Examples](https://github.com/Gagle/Node-BufferedWriter/tree/master/examples)  
[Change log](https://github.com/Gagle/Node-BufferedWriter/wiki/Change-log)  
[MIT License](https://github.com/Gagle/Node-BufferedWriter/blob/master/LICENSE)