/* Use the document.title notify::title property change signal to call
 * Python from JavaScript, as suggested here:
 * http://code.google.com/p/pywebkitgtk/wiki/HowDoI
 */

require([
	"PseudoXMLHttpRequest",
	"extend"
], function() {

this.ShockTherapySugarRequest = (function(global) {

	var constructor = function() {
		constructor.base.constructor.call(this);
		this._callbackName = "shockTherapySugarRequest" + constructor.callbackId++;
		this._send_title = null;
		this._interval = null;
	}

	constructor.callbackId = 0;

	/* We have to retry periodically until a response is received,
	since it's possible for title change events to be lost when there
	are many changes close together. */
	constructor.retryInterval = 200;

	extend(PseudoXMLHttpRequest, constructor);

	constructor.prototype.send = function(body) {
        var a = document.createElement('a');
        a.href = this._url;
        this._url = a.href;
		if (!global.origtitle)
			global.origtitle = global.document.title
		global[this._callbackName] = this._callback.bind(this);
		this._send_title = "ShockTherapySugarRequest:" +
			this._callbackName + ":" + this._url;
		this._interval = global.window.setInterval(
			this._interval_cb.bind(this),
			ShockTherapySugarRequest.retryInterval);
		global.document.title = this._send_title;
	}

	constructor.prototype._interval_cb = function() {
		if (this._send_title !== null)
			global.document.title = this._send_title;
	}

	constructor.prototype._callback = function(status, responseText) {
		if (this._interval !== null) {
			global.window.clearInterval(this._interval);
			this._interval = null;
			this._send_title = null;
		}
		delete global[this._callbackName];
		if (global.origtitle !== global.document.title)
			global.document.title = global.origtitle
		this.responseText = atob(responseText);

		if (this.responseType == "arraybuffer") {
			this.response = new ArrayBuffer(this.responseText.length);
			var responseText = this.responseText,
				ia = new Uint8Array(this.response);
			for (var i = 0; i < responseText.length; i++)
				ia[i] = responseText.charCodeAt(i);
		}

		this.status = status;
		this.readyState = this.DONE;
		if (this.onreadystatechange !== null) {
			this.onreadystatechange.apply(global);
		}
		if (this.onload !== null)
			this.onload.apply(global);
	}

	return constructor;

}(this));

});
