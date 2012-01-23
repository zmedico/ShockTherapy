
require([
	"simulateClick"
], function() {

this.saveUrl = (function(global) {
	var saveUrl = function(url, filename) {
		var link = global.window.document.createElement("a");
		link.href = url;
		link.download = filename;
		simulateClick(link);
	};
	return saveUrl;
}(this));

});
