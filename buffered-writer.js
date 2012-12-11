"use strict";

var EVENTS = require ("events");
var FS = require ("fs");
var errno = require ("errno-codes");

errno.create (errno.getNextAvailableErrno (), "INVALID_BUFFER_SIZE", 
		"The buffer size must be greater than 0.");
errno.create (errno.getNextAvailableErrno (), "STREAM_CLOSED", 
		"The stream is already closed, cannot write nor close it again.");
errno.create (errno.getNextAvailableErrno (), "INVALID_OFFSET_LENGTH", 
		"The offset or length parameters are not valid (offset={offset}, " +
		"length={length}, length-offset<0).");
errno.create (errno.getNextAvailableErrno (), "INVALID_DATA", 
		"The data can only be a Number, String, Array or Buffer");

var BUFFER_SIZE = 16384;
var EOL = process.platform === "win32"
		? new Buffer ([0x0d, 0x0a])
		: new Buffer ([0x0a]);
var strEOL = EOL.toString ();

var bw = module.exports = {};

bw.open = function (file, args){
	args = args || {};
	
	if (args.bufferSize === 0) args.bufferSize = -1;
	args.bufferSize = args.bufferSize || BUFFER_SIZE;
	if (args.bufferSize < 1) throw errno.get ("INVALID_BUFFER_SIZE");
	
	return new Writer (file, args);
};

var Writer = function (file, args){
	EVENTS.EventEmitter.call (this);
	
	this._bufferSize = args.bufferSize;
	this._encoding = args.encoding;
	this._buffer = null;
	this._offset = 0;
	this._closed = false;
	this._flushCallback;
	
	var me = this;
	this._stream = FS.createWriteStream (file, {
		flags: args.append ? "a" : "w",
		encoding: args.encoding,
		mode: args.mode,
		start: args.start
	}).on ("error", function (error){
		me.emit ("error", error);
	}).on ("drain", function (){
		if (me._flushCallback){
			me._flushCallback ();
			me._flushCallback = null;
		}
	});
};

Writer.prototype = Object.create (EVENTS.EventEmitter.prototype);
Writer.prototype.constructor = Writer;

Writer.prototype._error = function (error){
	if (this.listeners ("error").length !== 0){
		this.emit ("error", error);
	}else{
		throw error;
	}
};

Writer.prototype._flush = function (){
	var written = this._stream.write (
			new Buffer (this._offset !== this._bufferSize
					? this._buffer.slice (0, this._offset)
					: this._buffer));
	this._offset = 0;
	return written;
};

Writer.prototype._write = function (data, offset, length){
	var me = this;

	if (!this._buffer){
		this._buffer = new Buffer (this._bufferSize);
	}
	
	var bytes = length + this._offset > this._bufferSize ?
			this._bufferSize - this._offset :
			length;
	
	data.copy (this._buffer, this._offset, offset, offset + bytes);
	this._offset += bytes;
	offset += bytes;
	length -= bytes;
	if (this._offset === this._bufferSize){
		this._flush ();
		if (length !== 0){
			this._write (data, offset, length);
		}
	}
};

Writer.prototype.close = function (cb){
	if (this._closed){
		return this._error (errno.get ("STREAM_CLOSED"));
	}

	if (this._offset){
		this._flush ();
	}
	
	var me = this;
	this._stream.on ("close", function (){
		if (cb) cb ();
	});
	this._stream.end ();
	this._closed = true;
};

Writer.prototype.flush = function (cb){
	if (this._offset === 0) return cb ();
	if (!this._flush ()){
		this._flushCallback = cb;
	}else{
		cb ();
	}
};

Writer.prototype.line = function (){
	if (this._closed){
		return this._error (errno.get ("STREAM_CLOSED"));
	}
	this._write (EOL, 0, EOL.length);
	return this;
};

var toHexArray = function (n){
	var array = [];
	do{
		array.unshift (n & 0xff);
		n = n >>> 8;
	}while (n);
	return array;
};

Writer.prototype.write = function (buffer, offset, length){
	if (this._closed){
		return this._error (errno.get ("STREAM_CLOSED"));
	}
	
	offset = offset || 0;
	var stringError;
	
	var type = typeof buffer;
	if (type === "number"){
		buffer = toHexArray (buffer);
		length = length || buffer.length - offset;
		buffer = new Buffer (buffer);
	}else if (type === "string"){
		stringError = length - offset < 0;
		buffer = buffer.substr (offset, length);
		offset = 0;
		length = Buffer.byteLength (buffer, this._encoding);
		buffer = new Buffer (buffer, this._encoding);
	}else if (Array.isArray (buffer)){
		buffer = new Buffer (buffer);
		length = length || buffer.length - offset;
	}else if (Buffer.isBuffer (buffer)){
		length = length || buffer.length - offset;
	}else{
		var me = this;
		this.close (function (){
			me._error (errno.get ("INVALID_DATA"));
		});
		return;
	}
	
	if (stringError || length < 0){
		var me = this;
		this.close (function (){
			me._error (errno.get ("INVALID_OFFSET_LENGTH", {
				offset: offset,
				length: length
			}));
		});
		return;
	}
	
	if (length !== 0){
		this._write (buffer, offset, length);
	}
	return this;
};

Writer.prototype.writeln = function (buffer, offset, length){
	return this.write (buffer + strEOL, offset, length);
};