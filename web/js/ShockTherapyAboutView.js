
this.ShockTherapyAboutView = (function(global) {

	var constructor = function(uri, actionBar) {
		this._uri = uri;
		this._actionBar = actionBar;
		this._container = null;
		this._callback = null;
		this._content = null;
		this._req = null;
	}

	constructor.prototype._configureActionBar = function() {
		this._actionBar.setTitle("About");
		this._actionBar.setUpButtonUri("main.html");
		this._actionBar.setActions(["Main", "Screen Saver", "Options"]);
		this._actionBar.show();
	}

	constructor.prototype.display = function(container, callback) {
		this._configureActionBar();
		if (this._content === null) {
			this._container = container;
			this._callback = callback;
			this._initContent();
		}
		else {
			container.appendChild(this._content);
			if (callback)
				callback.apply(global);
		}
	}

	constructor.prototype.undisplay = function() {
		this._actionBar.hide();
	}

	constructor.prototype._initContent = function() {
		this._req = new XMLHttpRequest();
		this._req.onreadystatechange = this._loadCallback.bind(this);
		this._req.open("GET", this._uri);
		this._req.send(null);
	}

	constructor.prototype._loadCallback = function(e) {
		if (this._req.readyState === 4) {
			if (this._req.status !== 200)
				throw this._req.statusText;
			var div = this._container.ownerDocument.createElement("div");
			div.innerHTML = this._req.responseText;
			this._req = null;
			this._content = div.firstChild;
			div.removeChild(div.firstChild);
			this._container.appendChild(this._content);
			this._container = null;
			if (this._callback) {
				this._callback.apply(global);
				this._callback = null;
			}
		}
	}

	return constructor;

})(this);
