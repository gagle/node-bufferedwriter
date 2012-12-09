"use strict";

var ASSERT = require ("assert");
var FS = require ("fs");
var bw = require ("../buffered-writer");

var WIN = process.platform === "win32";

describe ("buffered-writer", function (){
	describe ("close", function (){
		it ("should emit a STREAM_CLOSED error if a close() has been executed " +
				"after closing the stream", function (done){
					var out = bw.open ("file").on ("error", function (error){
						ASSERT.equal (error.code, "STREAM_CLOSED");
						done ();
					});
					out.close ();
					out.close ();
				});
				
		it ("should throw a STREAM_CLOSED exception if a close() has been " +
				"executed after closing the stream and there's no error listener",
				function (done){
					var out = bw.open ("file");
					out.close ();
					ASSERT.throws (function (){
						out.close ();
					}, function (error){
						return error.code === "STREAM_CLOSED";
					});
					done ();
				});
		
		after (function (done){
			FS.unlink ("file", done);
		});
	});
	
	describe ("line", function (){
		it ("should emit a STREAM_CLOSED error if a line() has been executed " +
				"after closing the stream", function (done){
					var out = bw.open ("file").on ("error", function (error){
						ASSERT.equal (error.code, "STREAM_CLOSED");
						done ();
					});
					out.close ();
					out.line ();
				});
		
		it ("should throw a STREAM_CLOSED exception if a line() has been " +
				"executed after closing the stream and there's no error listener",
				function (done){
					var out = bw.open ("file");
					out.close ();
					ASSERT.throws (function (){
						out.line ();
					}, function (error){
						return error.code === "STREAM_CLOSED";
					});
					done ();
				});
		
		it ("should write \r\n on Windows, \n otherwise", function (done){
			bw.open ("file").line ().close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					if (WIN){
						ASSERT.ok (data[0] === 0x0d && data[1] === 0x0a);
					}else{
						ASSERT.ok (data[0] === 0x0a);
					}
					done ();
				});
			});
		});
		
		after (function (done){
			FS.unlink ("file", done);
		});
	});
	
	describe ("open", function (){
		it ("should throw an INVALID_BUFFER_SIZE exception if the buffer size " +
				"is less than 1", function (done){
					ASSERT.throws (
						function (){
							bw.open ("file", { bufferSize: 0 });
						},
						function (error){
							return error.code === "INVALID_BUFFER_SIZE";
						}
					);
					done ();
				});
		
		it ("should create an empty file if the file is opened and then closed",
				function (done){
					bw.open ("file").close (function (){
						FS.readFile ("file", function (error, data){
							if (error) return done (error);
							ASSERT.ok (data.length === 0);
							done ();
						});
					});
				});
	});
	
	describe ("write", function (){
		it ("should emit a STREAM_CLOSED error if a write() has been executed " +
				"after closing the stream", function (done){
					var out = bw.open ("file").on ("error", function (error){
						ASSERT.equal (error.code, "STREAM_CLOSED");
						done ();
					});
					out.close ();
					out.write ("asd");
				});
		
		it ("should throw a STREAM_CLOSED exception if a close() has been " +
				"executed after closing the stream and there's no error listener",
				function (done){
					var out = bw.open ("file");
					out.close ();
					ASSERT.throws (function (){
						out.write ("asd");
					}, function (error){
						return error.code === "STREAM_CLOSED";
					});
					done ();
				});
		
		it ("should write data regardless the buffer size (size < data)",
				function (done){
			bw.open ("file", { bufferSize: 1 }).write (0x010203).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02 && data[2] === 0x03);
					done ();
				});
			});
		});
		
		it ("should write data regardless the buffer size (size == data)",
				function (done){
			bw.open ("file", { bufferSize: 3 }).write (0x010203).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02 && data[2] === 0x03);
					done ();
				});
			});
		});
		
		it ("should write data regardless the buffer size (size > data)",
				function (done){
			bw.open ("file", { bufferSize: 6 }).write (0x010203).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02 && data[2] === 0x03);
					done ();
				});
			});
		});
		
		it ("should append data if append == true",
				function (done){
			bw.open ("file").write (0x01).close (function (){
				bw.open ("file", { append: true }).write (0x02).close (function (){
					FS.readFile ("file", function (error, data){
						if (error) return done (error);
						ASSERT.ok (data[0] === 0x01 && data[1] === 0x02);
						done ();
					});
				});
			});
		});
		
		it ("should encode strings (utf8 by default)",
				function (done){
			bw.open ("file").write ("↑").close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0xe2 && data[1] === 0x86 && data[2] === 0x91);
					done ();
				});
			});
		});
		
		it ("should write empty strings",
				function (done){
			bw.open ("file").write ("").close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data.length === 0);
					done ();
				});
			});
		});
		
		it ("should write utf8 characters larger than 1 byte with a buffer size " +
				"minor than the character length",
				function (done){
			bw.open ("file", { bufferSize: 1 }).write ("↑").close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0xe2 && data[1] === 0x86 && data[2] === 0x91);
					done ();
				});
			});
		});
		
		it ("should convert numbers to its hexadecimal string representation " +
				"(encoding is ignored)",
				function (done){
			bw.open ("file", { encoding: "utf8" }).write (0x0102).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02);
					done ();
				});
			});
		});
		
		it ("should write Buffers (encoding is ignored, the buffer's encoding " +
				"is used)", function (done){
			bw.open ("file", { encoding: "utf8" }).write (new Buffer ([0x01, 0x02]))
					.close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02);
					done ();
				});
			});
		});
		
		it ("should write arrays", function (done){
			bw.open ("file").write ([0x01, 0x02]).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x01 && data[1] === 0x02);
					done ();
				});
			});
		});
		
		it ("should write empty arrays", function (done){
			bw.open ("file").write ([]).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data.length === 0);
					done ();
				});
			});
		});
		
		it ("should apply offset and length", function (done){
			bw.open ("file").write ([0x01, 0x02, 0x03, 0x04], 1, 2)
					.close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x02 && data[1] === 0x03);
					done ();
				});
			});
		});
		
		it ("should apply offset and length (length not set, Buffer)",
				function (done){
			bw.open ("file").write (new Buffer ([0x01, 0x02, 0x03, 0x04]), 1)
					.close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x02 && data[1] === 0x03 && data[2] === 0x04);
					done ();
				});
			});
		});
		
		it ("should apply offset and length (length not set, Array)",
				function (done){
			bw.open ("file").write ([0x01, 0x02, 0x03, 0x04], 1).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x02 && data[1] === 0x03 && data[2] === 0x04);
					done ();
				});
			});
		});
		
		it ("should apply offset and length (length not set, Number)",
				function (done){
			bw.open ("file").write (0x01020304, 1).close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 0x02 && data[1] === 0x03 && data[2] === 0x04);
					done ();
				});
			});
		});
		
		it ("should apply offset and length (length not set, String)",
				function (done){
			bw.open ("file").write ("asd", 1)
					.close (function (){
				FS.readFile ("file", function (error, data){
					if (error) return done (error);
					ASSERT.ok (data[0] === 115 && data[1] === 100);
					done ();
				});
			});
		});
		
		it ("should emit an INVALID_OFFSET_LENGTH error if the offset and " +
				"length parameters are invalid (the stream is closed)",
				function (done){
			var out = bw.open ("file");
			out.on ("error", function (error){
				ASSERT.equal (error.code, "INVALID_OFFSET_LENGTH");
				ASSERT.ok (out._closed);
				done ();
			}).write ("asd", 5, -1);
		});
		
		it ("should throw an INVALID_OFFSET_LENGTH exception if the offset and " +
				"length parameters are invalid (the stream is closed) and there's " +
				"no error listener", function (done){
					var out = bw.open ("file");
					//Hack
					out._error = function (error){
						ASSERT.equal (error.code, "INVALID_OFFSET_LENGTH");
						done ();
					};
					out.write ("asd", 5, -1);
				});
		
		it ("should emit an INVALID_DATA error if the data is not a Number, " +
				"String, Array or Buffer",
				function (done){
			var out = bw.open ("file");
			out.on ("error", function (error){
				ASSERT.equal (error.code, "INVALID_DATA");
				ASSERT.ok (out._closed);
				done ();
			}).write (function (){});
		});
		
		it ("should throw an INVALID_DATA exception if the data is not a " +
				"Number, String, Array or Buffer and there's no error listener",
				function (done){
					var out = bw.open ("file");
					//Hack
					out._error = function (error){
						ASSERT.equal (error.code, "INVALID_DATA");
						done ();
					};
					out.write (function (){});
				});
		
		it ("should write data from multiple nature", function (done){
			bw.open ("file")
					.write ([0x00, 0x01, 0x02])
					.write (new Buffer ([0x03, 0x04]), 1, 1)
					.write (0x0506)
					.write ("↑a", 1)
					.close (function (){
						FS.readFile ("file", function (error, data){
							if (error) return done (error);
							ASSERT.ok (
								data[0] === 0x00 &&
								data[1] === 0x01 &&
								data[2] === 0x02 &&
								data[3] === 0x04 &&
								data[4] === 0x05 &&
								data[5] === 0x06 &&
								data[6] === 0x86 &&
								data[7] === 0x91 &&
								data[8] === 0x61
							);
							done ();
						});
					});
		});
		
		afterEach (function (done){
			FS.unlink ("file", done);
		});
	});
});
