/**
 * @name BufferedWriter.
 * @description Fully configurable buffered writer for node.js.
 *
 * @author Gabriel Llamas
 * @created 27/04/2012
 * @modified 28/04/2012
 * @version 0.1.0
 */
"use strict";

var EVENTS = require ("events");
var FS = require ("fs");

var BUFFER_SIZE = 16384;
var EOL = process.platform.indexOf ("win") !== -1 ? new Buffer ([0x0D, 0x0A]) : new Buffer ([0x0A]);

var INVALID_BUFFER_SIZE = new Error ("The buffer size must be greater than 0.");

var BufferedWriter = function (fileName, bufferSize, encoding, append){
	EVENTS.EventEmitter.call (this);
	
	var argsLen = arguments.length;
	var type;
	if (argsLen === 1){
		bufferSize = BUFFER_SIZE;
		encoding = null;
		append = false;
	}else if (argsLen === 2){
		type = typeof bufferSize;
		if (type === "string"){
			encoding = bufferSize;
			bufferSize = BUFFER_SIZE;
			append = false;
		}else if (type === "boolean"){
			append = bufferSize;
			bufferSize = BUFFER_SIZE;
			encoding = null;
		}else{
			encoding = null;
			append = false;
		}
	}else if (argsLen === 3){
		type = typeof bufferSize;
		if (type === "number" && typeof encoding === "boolean"){
			append = encoding;
			encoding = null;
		}else if (type === "string"){
			append = encoding;
			encoding = bufferSize;
			bufferSize = BUFFER_SIZE;
		}else{
			append = false;
		}
	}
	
	if (bufferSize < 1) throw INVALID_BUFFER_SIZE;
	
	this._settings = {
		encoding: encoding,
		bufferSize: bufferSize,
		append: append ? "a" : "w"
	};
	
	this._fileName = fileName;
	this._stream = null;
	this._buffer = null;
	this._bufferOffset = 0;
};

BufferedWriter.prototype = Object.create (EVENTS.EventEmitter.prototype);
BufferedWriter.prototype.constructor = BufferedWriter;

BufferedWriter.prototype._flush = function (){
	this._stream.write (this._bufferOffset !== this._settings._bufferSize ?
		this._buffer.slice (0, this._bufferOffset) : this._buffer);
	this._bufferOffset = 0;
};

BufferedWriter.prototype._getAvailableSpace = function (n){
	if (n + this._bufferOffset > this._settings.bufferSize){
		n = this._settings.bufferSize - this._bufferOffset;
	}
	return n;
};

BufferedWriter.prototype._write = function (data, offset, length){
	var me = this;
	if (!this._stream){
		this._buffer = new Buffer (this._settings.bufferSize);
		this._stream = FS.createWriteStream (this._fileName, {
			flags: me._settings.append,
			encoding: me._settings.encoding
		});
		this._stream.on ("error", function (error){
			me.emit (error);
		});
	}
	
	var bytes = this._getAvailableSpace (length);
	data.copy (this._buffer, this._bufferOffset, offset, offset + bytes);
	this._bufferOffset += bytes;
	offset += bytes;
	length -= bytes;
	if (this._bufferOffset === this._settings.bufferSize){
		this._flush ();
		if (length !== 0){
			this._write (data, offset, length);
		}
	}
};

BufferedWriter.prototype.close = function (){
	if (!this._stream) return;

	if (this._bufferOffset !== 0){
		this._flush ();
	}
	
	this._stream.end ();
	this._stream = null;
	this._buffer = null;
};

BufferedWriter.prototype.newLine = function (){
	this._write (EOL, 0, EOL.length);
	return this;
};

var fixBufferType = function (bw, buffer){
	var isArray = function (array){
		return Object.prototype.toString.call (array) === "[object Array]";
	};
	
	if (buffer instanceof Buffer) return buffer;
	if (isArray (buffer)) return new Buffer (buffer);
	return new Buffer ([buffer]);
};

BufferedWriter.prototype.write = function (buffer, offset, length){
	if (typeof buffer === "string"){
		offset = 0;
		length = buffer.length;
		buffer = new Buffer (buffer, this._settings.encoding)
	}else{
		buffer = fixBufferType (this, buffer);
		var argsLen = arguments.length;
		if (argsLen === 1){
			offset = 0;
			length = 1;
		}else if (argsLen === 2){
			offset = 0;
			length = 1;
		}
	}
	
	this._write (buffer, offset, length);
	return this;
};

module.exports = BufferedWriter;