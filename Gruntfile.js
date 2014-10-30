
module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');
    var outputDir = grunt.option('output') || process.cwd();
    var buildDir = path.join(outputDir, "build");
    var iconTempDir = path.join(buildDir, "icons");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    });

	grunt.registerTask('generate-favicon', 'Generate favicon.ico from png', function () {
		var done = this.async();
		var convertPngToIco = require('./util/convertPngToIco');
		var pngFile = path.join(iconTempDir,
			"High_voltage_warning_48.png");
		var outputFile = path.join(iconTempDir,
			"High_voltage_warning_48.ico");

		convertPngToIco.convertFile(
			pngFile,
			outputFile,
			function(err) {
				done(err);
			});
	});
};
