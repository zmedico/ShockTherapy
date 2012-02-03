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
	}

	constructor.callbackId = 0;

	extend(PseudoXMLHttpRequest, constructor);

	constructor.prototype.send = function(body) {
        var a = document.createElement('a');
        a.href = this._url;
        this._url = a.href;
		if (!global.origtitle)
			global.origtitle = global.document.title
		global[this._callbackName] = this._callback.bind(this);
		global.document.title = "ShockTherapySugarRequest:" +
			this._callbackName + ":" + this._url;
	}

	constructor.prototype._callback = function(status, responseText) {
		delete global[this._callbackName];
		if (global.origtitle !== global.document.title)
			global.document.title = global.origtitle
		this.responseText = unescape(responseText);
		this.status = status;
		this.readyState = this.DONE;
		if (this.onreadystatechange !== null) {
			this.onreadystatechange.apply(global);
		}
	}

	return constructor;

}(this));

});
