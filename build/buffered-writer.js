"use strict";var EVENTS=require("events"),FS=require("fs"),Error=require("errno-codes");Error.create("INVALID_BUFFER_SIZE",Error.getNextAvailableErrno(),"The buffer size must be greater than 0.");var BUFFER_SIZE=16384,EOL=process.platform.indexOf("win")!==-1?new Buffer([13,10]):new Buffer([10]),toHexArray=function(e){var t=[];do t.unshift(e&255),e>>>=8;while(e);return t},BufferedWriter=function(e,t){EVENTS.EventEmitter.call(this),t=t||{},t.bufferSize===0&&(t.bufferSize=-1),this._settings={bufferSize:t.bufferSize||BUFFER_SIZE,encoding:t.encoding||null,append:t.append?"a":"w"};if(this._settings.bufferSize<1)throw Error.get(Error.INVALID_BUFFER_SIZE);this._fileName=e,this._stream=null,this._buffer=null,this._bufferOffset=0};BufferedWriter.prototype=Object.create(EVENTS.EventEmitter.prototype),BufferedWriter.prototype.constructor=BufferedWriter,BufferedWriter.prototype._canWrite=function(e){return e+this._bufferOffset>this._settings.bufferSize&&(e=this._settings.bufferSize-this._bufferOffset),e},BufferedWriter.prototype._flush=function(){this._stream.write(new Buffer(this._bufferOffset!==this._settings.bufferSize?this._buffer.slice(0,this._bufferOffset):this._buffer)),this._bufferOffset=0},BufferedWriter.prototype._write=function(e,t,n){var r=this;this._buffer||(this._buffer=new Buffer(this._settings.bufferSize)),this.touch(r._settings.append);if(n===0)return;var i=this._canWrite(n);e.copy(this._buffer,this._bufferOffset,t,t+i),this._bufferOffset+=i,t+=i,n-=i,this._bufferOffset===this._settings.bufferSize&&(this._flush(),n!==0&&this._write(e,t,n))},BufferedWriter.prototype.close=function(e){if(!this._stream)return;this._bufferOffset!==0&&this._flush();var t=this;this._stream.on("close",function(){e&&e.call(this)}),this._stream.destroySoon(),this._stream=null,this._fd=null,this._buffer=null},BufferedWriter.prototype.newLine=function(){return this._write(EOL,0,EOL.length),this},BufferedWriter.prototype.touch=function(e){if(this._stream)return this;e=e||"w";var t=this;return this._stream=FS.createWriteStream(this._fileName,{flags:e,encoding:t._settings.encoding}).on("error",function(e){t.emit("error",e)}),this},BufferedWriter.prototype.write=function(e,t,n){var r=typeof e;if(r==="number")t=0,e=toHexArray(e),n=e.length,e=new Buffer(e);else if(r==="string")t=0,n=Buffer.byteLength(e,this._settings.encoding),e=new Buffer(e,this._settings.encoding);else{Array.isArray(e)&&(e=new Buffer(e));var i=arguments.length;i===1&&(t=0,n=e.length==0?0:1)}return this._write(e,t,n),this},module.exports=BufferedWriter;