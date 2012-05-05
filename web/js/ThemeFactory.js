
require([
	"Theme",
], function() {

this.ThemeFactory = (function(global) {

	var constructor = function(uri) {
		this.uri = uri;
		this.loaded = false;
		this._req = null;
		this._callback = null;
		this._themes = null;
	}

	constructor.prototype.load = function(callback) {
		var async = false;
		if (callback) {
			async = true;
			this._callback = callback;
		}
		this._req = new XMLHttpRequest();
		if (async)
			this._req.onreadystatechange = this._loadComplete.bind(this)
		this._req.open("GET", this.uri + "/data/themes.json", async);
		this._req.send(null);
		if (!async)
			this._loadComplete(null);
	}

	constructor.prototype._loadComplete = function(e) {
		if (this._req.readyState === 4) {
			if (this._req.status != 200)
				throw this._req.statusText;
			this._themes = JSON.parse(this._req.responseText);
			this._req = null;
			this.loaded = true;
			if (this._callback != null) {
				this._callback.apply(global);
				this._callback = null;
			}
		}
	}

	constructor.prototype.listThemes = function() {
		return this._themes;
	}

	constructor.prototype.createObject = function(key) {
		var instance = null;
		if (this._themes.hasOwnProperty(key))
			instance = new Theme(this._themes, key, this.uri);
		return instance;
	}

	constructor.prototype.withScheme = function(scheme) {
		if (!this.loaded)
			this.load();
		var i, keys, theme;
		keys = Object.keys(this._themes);
		for (i = 0; i < keys.length ; i++) {
			theme = this._themes[keys[i]];
			if (theme.scheme == scheme)
				return new Theme(this._themes, keys[i], this.uri)
		}
		return null;
	}

	constructor.prototype.getDefault = function() {
		if (!this.loaded)
			this.load();
		var instance = null;
		if ((navigator.userAgent + navigator.appVersion).toLowerCase().indexOf("mobile") > -1)
			instance = this.withScheme("light-on-dark");
		else
			instance = this.withScheme("dark-on-light");
		return instance;
	}

	return constructor;

}(this));

});
