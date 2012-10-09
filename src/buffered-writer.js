/**
 * @name BufferedWriter.
 * @description Fully configurable buffered writer for node.js.
 *
 * @author Gabriel Llamas
 * @created 27/04/2012
 * @modified 09/10/2012
 * @version 0.1.12
 */
"use strict";

var EVENTS = require ("events");
var FS = require ("fs");

var Error = require ("errno-codes");

Error.create (Error.getNextAvailableErrno (), "INVALID_BUFFER_SIZE", 
		"The buffer size must be greater than 0.");

var BUFFER_SIZE = 16384;
var EOL = process.platform === "win32" ? new Buffer ([0x0D, 0x0A]) : new Buffer ([0x0A]);

var toHexArray = function (n){
	var array = [];
	do{
		array.unshift (n & 0xFF);
		n = n >>> 8;
	}while (n);
	return array;
};

var BufferedWriter = function (fileName, settings){
	EVENTS.EventEmitter.call (this);
	
	settings = settings || {};
	
	if (settings.bufferSize === 0) settings.bufferSize = -1;
	this._settings = {
		bufferSize: settings.bufferSize || BUFFER_SIZE,
		encoding: settings.encoding || null,
		append: settings.append ? "a" : "w"
	};
	
	if (this._settings.bufferSize < 1) throw Error.get (Error.INVALID_BUFFER_SIZE);
	
	this._fileName = fileName;
	this._stream = null;
	this._buffer = null;
	//Marca la primera posicion libre del buffer donde escribir bytes
	this._offset = 0;
	this._closing = false;
};

BufferedWriter.prototype = Object.create (EVENTS.EventEmitter.prototype);
BufferedWriter.prototype.constructor = BufferedWriter;

BufferedWriter.prototype._flush = function (){
	//Cuando se escribe un buffer en el stream internamente no se crea una copia, solo se guarda
	//la referencia, por lo que si el buffer se modifica desde fuera internamente tambien
	//se habra modificado. Es por eso que se instancia un nuevo buffer para escribir datos.
	this._stream.write (new Buffer (this._offset !== this._settings.bufferSize ?
		this._buffer.slice (0, this._offset) : this._buffer));
	this._offset = 0;
};

BufferedWriter.prototype._write = function (data, offset, length){
	var me = this;

	if (!this._buffer){
		this._buffer = new Buffer (this._settings.bufferSize);
	}
	
	this.touch (me._settings.append);
	
	if (length === 0) return;
	
	var bytes = length + this._offset > this._settings.bufferSize ?
			this._settings.bufferSize - this._offset :
			length;
	
	data.copy (this._buffer, this._offset, offset, offset + bytes);
	this._offset += bytes;
	offset += bytes;
	length -= bytes;
	if (this._offset === this._settings.bufferSize){
		this._flush ();
		if (length !== 0){
			//Mientras queden bytes por escribir en el buffer se van haciendo llamadas recursivas
			this._write (data, offset, length);
		}
	}
};

BufferedWriter.prototype.close = function (cb){
	if (this._closing || !this._stream) return;
	if (cb) cb = cb.bind (this);

	if (this._offset !== 0){
		this._flush ();
	}
	
	var me = this;
	this._stream.on ("close", function (){
		me._stream = null;
		me._buffer = null;
		me._closing = false;
		if (cb) cb ();
	});
	this._stream.destroySoon ();
	this._closing = true;
};

BufferedWriter.prototype.newLine = function (){
	this._write (EOL, 0, EOL.length);
	return this;
};

BufferedWriter.prototype.touch = function (_append){
	if (this._closing) return this;
	_append = _append || "w";
	
	var me = this;
	this._stream = FS.createWriteStream (this._fileName, {
			flags: _append,
			encoding: me._settings.encoding
		})
		.on ("error", function (error){
			me.emit ("error", error);
		});
	
	return this;
};

BufferedWriter.prototype.write = function (buffer, offset, length){
	if (this._closing) return this;
	
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
		if (Array.isArray (buffer)){
			buffer = new Buffer (buffer);
		}
		var argsLen = arguments.length;
		if (argsLen === 1){
			offset = 0;
			length = buffer.length === 0 ? 0 : 1;
		}
	}
	
	this._write (buffer, offset, length);
	return this;
};

module.exports = BufferedWriter;