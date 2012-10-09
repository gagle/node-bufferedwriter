"use strict";var EVENTS=require("events"),FS=require("fs"),Error=require("errno-codes");Error.create(Error.getNextAvailableErrno(),"INVALID_BUFFER_SIZE","The buffer size must be greater than 0.");var BUFFER_SIZE=16384,EOL=process.platform==="win32"?new Buffer([13,10]):new Buffer([10]),toHexArray=function(a){var b=[];do b.unshift(a&255),a>>>=8;while(a);return b},BufferedWriter=function(a,b){EVENTS.EventEmitter.call(this),b=b||{},b.bufferSize===0&&(b.bufferSize=-1),this._settings={bufferSize:b.bufferSize||BUFFER_SIZE,encoding:b.encoding||null,append:b.append?"a":"w"};if(this._settings.bufferSize<1)throw Error.get(Error.INVALID_BUFFER_SIZE);this._fileName=a,this._stream=null,this._buffer=null,this._offset=0,this._closing=!1};BufferedWriter.prototype=Object.create(EVENTS.EventEmitter.prototype),BufferedWriter.prototype.constructor=BufferedWriter,BufferedWriter.prototype._flush=function(){this._stream.write(new Buffer(this._offset!==this._settings.bufferSize?this._buffer.slice(0,this._offset):this._buffer)),this._offset=0},BufferedWriter.prototype._write=function(a,b,c){var d=this;this._buffer||(this._buffer=new Buffer(this._settings.bufferSize)),this.touch(d._settings.append);if(c===0)return;var e=c+this._offset>this._settings.bufferSize?this._settings.bufferSize-this._offset:c;a.copy(this._buffer,this._offset,b,b+e),this._offset+=e,b+=e,c-=e,this._offset===this._settings.bufferSize&&(this._flush(),c!==0&&this._write(a,b,c))},BufferedWriter.prototype.close=function(a){if(this._closing||!this._stream)return;a&&(a=a.bind(this)),this._offset!==0&&this._flush();var b=this;this._stream.on("close",function(){b._stream=null,b._buffer=null,b._closing=!1,a&&a()}),this._stream.destroySoon(),this._closing=!0},BufferedWriter.prototype.newLine=function(){return this._write(EOL,0,EOL.length),this},BufferedWriter.prototype.touch=function(a){if(this._closing)return this;a=a||"w";var b=this;return this._stream=FS.createWriteStream(this._fileName,{flags:a,encoding:b._settings.encoding}).on("error",function(a){b.emit("error",a)}),this},BufferedWriter.prototype.write=function(a,b,c){if(this._closing)return this;var d=typeof a;if(d==="number")b=0,a=toHexArray(a),c=a.length,a=new Buffer(a);else if(d==="string")b=0,c=Buffer.byteLength(a,this._settings.encoding),a=new Buffer(a,this._settings.encoding);else{Array.isArray(a)&&(a=new Buffer(a));var e=arguments.length;e===1&&(b=0,c=a.length===0?0:1)}return this._write(a,b,c),this},module.exports=BufferedWriter;