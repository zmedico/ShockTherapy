
define([
	"simulateClick"
], function(simulateClick) {

	var global = this;

	var saveUrl = function(url, filename) {
		var link = global.window.document.createElement("a");
		link.href = url;
		link.download = filename;
		simulateClick(link);
	};
	return saveUrl;

});
