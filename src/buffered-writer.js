/**
 * @name BufferedWriter.
 * @description Fully configurable buffered writer for node.js.
 *
 * @author Gabriel Llamas
 * @created 27/04/2012
 * @modified 28/04/2012
 * @version 0.0.1
 */
"use strict";

var EVENTS = require ("events");
var FS = require ("fs");

var BUFFER_SIZE = 16384;
var EOL = process.platform.indexOf ("win") !== -1 ? new Buffer ([0x0D, 0x0A]) : new Buffer ([0x0A]);

var INVALID_BUFFER_SIZE = new Error ("The buffer size must be greater than 0.");

var BufferedWriter = function (fileName, bufferSize, encoding, append){
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
	this._fd = null;
	this._buffer = null;
	this._bufferOffset = 0;
};

BufferedWriter.prototype._getAvailableSpace = function (n){
	if (n + this._bufferOffset > this._settings.bufferSize){
		n = this._settings.bufferSize - this._bufferOffset;
	}
	return n;
};

BufferedWriter.prototype._open = function (cb){
	if (this._fd) return cb (null, this._fd);
	
	var me = this;
	FS.open (this._fileName, this._settings.append, function (error, fd){
		if (error) return cb (error, null);
		
		me._fd = fd;
		me._buffer = new Buffer (me._settings.bufferSize);
		cb (null, me._fd);
	});
};

BufferedWriter.prototype._write = function (data, offset, length, cb){
	var me = this;
	this._open (function (error, fd){
		if (error){
			if (cb) cb (error);
			return;
		}
		
		var bytes = me._getAvailableSpace (length);
		data.copy (me._buffer, me._bufferOffset, offset, offset + bytes);
		me._bufferOffset += bytes;
		offset += bytes;
		length -= bytes;
		if (me._bufferOffset === me._settings.bufferSize){
			me.flush (function (error){
				if (error){
					if (cb) cb (error);
				}else if (length !== 0){
					me._write (data, offset, length, cb);
				}
			});
		}else{
			if (cb) cb (null);
		}
	});
};

BufferedWriter.prototype.close = function (cb){
	if (cb) cb = cb.bind (this);
	if (!this._fd){
		if (cb) cb (null);
		return;
	}
	
	var close = function (){
		FS.close (me._fd, function (error){
			me._fd = null;
			me._buffer = null;
			if (cb) cb (error);
		});
	};
	
	var me = this;
	if (this._bufferOffset !== 0){
		this.flush (function (error){
			if (error){
				if (cb) cb (error);
			}else{
				close ();
			}
		});
	}else{
		close ();
	}
};

BufferedWriter.prototype.flush = function (cb){
	if (cb) cb = cb.bind (this);
	if (!this._fd){
		if (cb) cb (null);
		return;
	}
	var me = this;
	FS.write (this._fd, this._buffer, 0, this._bufferOffset, null, function (error){
		if (error){
			if (cb) cb (error);
		}else{
			me._bufferOffset = 0;
			if (cb) cb (null);
		}
	});
};

BufferedWriter.prototype.newLine = function (cb){
	if (cb) cb = cb.bind (this);
	this._write (EOL, 0, EOL.length, function (error){
		if (cb) cb (error);
	});
};

var fixBufferType = function (bw, buffer){
	var isArray = function (array){
		return Object.prototype.toString.call (array) === "[object Array]";
	};
	
	if (buffer instanceof Buffer) return buffer;
	if (isArray (buffer)) return new Buffer (buffer);
	return new Buffer ([buffer]);
};

BufferedWriter.prototype.write = function (buffer, offset, length, cb){
	if (typeof buffer === "string"){
		cb = offset;
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
			cb = offset;
			offset = 0;
			length = 1;
		}
	}
	
	if (cb) cb = cb.bind (this);
	
	this._write (buffer, offset, length, function (error){
		if (cb) cb (error);
	});
};

module.exports = BufferedWriter;