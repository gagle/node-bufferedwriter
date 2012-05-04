var BufferedWriter = require ("../../build/buffered-writer");

new BufferedWriter ("tmp", { encoding: "utf8", bufferSize: 2 }).write ("↑↓←→").close ();