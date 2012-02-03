
this.PseudoXMLHttpRequest = (function() {

	var constructor = function() {
		this.onabort = null;
		this.onerror = null;
		this.onload = null;
		this.onloadstart = null;
		this.onprogress = null;
		this.onreadystatechange = null;
		this.readyState = 0;
		this.response = "";
		this.responseText = "";
		this.responseType = "";
		this.responseXML = null;
		this.status = 0;
		this.statusText = "";
		this.withCredentials = false;

		this._method = null;
		this._url = null;
	}

	constructor.prototype.DONE = 4;
	constructor.prototype.HEADERS_RECEIVED = 2;
	constructor.prototype.LOADING = 3;
	constructor.prototype.OPENED = 1;
	constructor.prototype.UNSENT = 0;

	constructor.prototype.open = function(method, url, async) {
		this._method = method;
		this._url = url;
	}

	constructor.prototype.send = function(body) {
		throw "Not Implemented"
	}

	return constructor;
}());
