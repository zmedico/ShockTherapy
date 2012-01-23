this.openFileDialog = (function(global) {
	var openFileDialog = function(callback) {
		var doc = global.window.document, fileInput = doc.createElement("input");
		fileInput.type = "file";
		fileInput.style.width = "0px";
		fileInput.style.height = "0px";
		fileInput.style.opacity = 0;
		fileInput.addEventListener("change", callback, false);
		doc.body.appendChild(fileInput);
		// Apparently the following click won't work when
		// done synchronously, so use a timeout.
		global.window.setTimeout(function ()
		{
			fileInput.click();
			doc.body.removeChild(fileInput);
		}, 0);
	};
	return openFileDialog;
}(this));
