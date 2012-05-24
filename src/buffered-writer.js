/**
 * @name BufferedWriter.
 * @description Fully configurable buffered writer for node.js.
 *
 * @author Gabriel Llamas
 * @created 27/04/2012
 * @modified 24/05/2012
 * @version 0.1.7
 */
"use strict";

var EVENTS = require ("events");
var FS = require ("fs");

var BUFFER_SIZE = 16384;
var EOL = process.platform.indexOf ("win") !== -1 ? new Buffer ([0x0D, 0x0A]) : new Buffer ([0x0A]);

var INVALID_BUFFER_SIZE = new Error ("The buffer size must be greater than 0.");

var BufferedWriter = function (fileName, settings){
	EVENTS.EventEmitter.call (this);
	
	settings = settings || {};
	
	if (settings.bufferSize === 0) settings.bufferSize = -1;
	this._settings = {
		bufferSize: settings.bufferSize || BUFFER_SIZE,
		encoding: settings.encoding || null,
		append: settings.append ? "a" : "w"
	};
	
	if (this._settings.bufferSize < 1) throw INVALID_BUFFER_SIZE;
	
	this._fileName = fileName;
	this._stream = null;
	this._buffer = null;
	this._bufferOffset = 0;
};

BufferedWriter.prototype = Object.create (EVENTS.EventEmitter.prototype);
BufferedWriter.prototype.constructor = BufferedWriter;

BufferedWriter.prototype._flush = function (){
	this._stream.write (new Buffer (this._bufferOffset !== this._settings.bufferSize ?
		this._buffer.slice (0, this._bufferOffset) : this._buffer));
	this._bufferOffset = 0;
};

BufferedWriter.prototype._canWrite = function (n){
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
			flags: me._settings.append
		});
		this._stream.on ("error", function (error){
			me.emit ("error", error);
		});
	}
	
	var bytes = this._canWrite (length);
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

BufferedWriter.prototype.close = function (cb){
	if (!this._stream) return;

	if (this._bufferOffset !== 0){
		this._flush ();
	}
	
	var me = this;
	this._stream.on ("close", function (){
		if (cb) cb.call (this);
	});
	this._stream.destroySoon ();
	this._stream = null;
	this._buffer = null;
};

BufferedWriter.prototype.newLine = function (){
	this._write (EOL, 0, EOL.length);
	return this;
};

var isArray = function (array){
	return Object.prototype.toString.call (array) === "[object Array]";
};

var toHexArray = function (n){
	var array = [];
	do{
		array.unshift (n & 0xFF);
		n = n >>> 8;
	}while (n);
	return array;
};

BufferedWriter.prototype.write = function (buffer, offset, length){
	var type = typeof buffer;
	if (type === "number"){
		offset = 0;
		buffer = toHexArray (buffer);
		length = buffer.length;
		buffer = new Buffer (buffer);
	}else if (type === "string"){
		offset = 0;
		length = Buffer.byteLength (buffer, this._settings.encoding);
		buffer = new Buffer (buffer, this._settings.encoding);
	}else{
		if (isArray (buffer)){
			buffer = new Buffer (buffer);
		}
		var argsLen = arguments.length;
		if (argsLen === 1){
			offset = 0;
			length = 1;
		}
	}
	
	this._write (buffer, offset, length);
	return this;
};

module.exports = BufferedWriter;