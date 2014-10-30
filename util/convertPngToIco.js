
/*
ICO header generation derived from http://mrcoles.com/favicon-creator/favicon.js
*/
module.exports.convertFile = function (inputFile, outputFile, callback) {
	var fs = require('fs');
	fs.readFile(inputFile, {encoding: null}, function (err, data) {
		if (err)
			callback(err);
		else {
			fs.writeFile(outputFile,
				module.exports.convertBuffer(data), callback);
		}
	});
};

module.exports.convertBuffer = function(inputBuf) {
	var ICO_HEADER_LENGTH = 22;
	// Read dimensions from the PNG IHDR chunk.
	var dimensions = module.exports.getPngSize(inputBuf);
	var output = new Buffer(ICO_HEADER_LENGTH + inputBuf.length);
	// Reserved. Should always be 0.
	output.writeInt16LE(0x00, 0);
	// Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid.
	output.writeInt16LE(0x01, 2);
	// Specifies number of images in the file.
	output.writeInt16LE(0x01, 4);
	// Specifies image width and height in pixels. Can be any number between 0 to 255. Special case: 0 means 256 pixels
	output.writeUInt8(dimensions.width, 6);
	output.writeUInt8(dimensions.height, 7);
	// Specifies number of colors in the color palette. Should be 0 if the image is truecolor.
	output.writeUInt8(0x00, 8);
	// Reserved. Should be 0.
	output.writeUInt8(0x00, 9);
	// In .ICO format: Specifies color planes. Should be 0 or 1.
	output.writeInt16LE(0x01, 10);
	// In .ICO format: Specifies bits per pixel (32 = 24 color + 8 alpha)
	output.writeInt16LE(0x20, 12);
	// Specifies the size of the image data in bytes.
	output.writeInt32LE(inputBuf.length, 14);
	// Specifies the offset of bitmap data address in the file.
	output.writeInt32LE(ICO_HEADER_LENGTH, 18);
	// The png data
	inputBuf.copy(output, ICO_HEADER_LENGTH, 0, inputBuf.length);
	return output;
};

module.exports.getPngSize = function(buf) {
	var PNG_IHDR_WIDTH_OFFSET = 16;
	var PNG_IHDR_HEIGHT_OFFSET = 20;

	return {
		width: buf.readUInt32BE(PNG_IHDR_WIDTH_OFFSET),
		height: buf.readUInt32BE(PNG_IHDR_HEIGHT_OFFSET)
	};
};
