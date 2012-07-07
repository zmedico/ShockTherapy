
require([
	"extend",
	"require",
	"ShockTherapy",
	"ShockTherapyReadonlyConfig"
], function() {

this.ShockTherapyConfig = (function(global) {

	var constructor = function(prefix)
	{
		constructor.base.constructor.call(this, null);
		this.prefix = prefix;
		this.android = ShockTherapy.android;
		this.sugar = ShockTherapy.sugar;
		this._callback = null;
		this._req = null;
		this._disable_commit = 0;
	}

	extend(ShockTherapyReadonlyConfig, constructor);

	constructor.prototype.load = function(callback) {
		this._callback = callback;
		if (this.sugar) {
			require(["ShockTherapySugarRequest"], this._load.bind(this));
		}
		else {
			this._callback.apply(global);
			this._callback = null;
		}
	}

	constructor.prototype._load = function() {
		global.XMLHttpRequest = ShockTherapySugarRequest;
		this._req = new ShockTherapySugarRequest()
		this._req.onreadystatechange = this._loadComplete.bind(this);
		this._req.open("GET", "/ShockTherapyConfig.load");
		this._req.send(null);
	}

	constructor.prototype._loadComplete = function(e) {
		if (this._req.readyState === 4) {
			if (this._req.status !== 200)
				throw this._req.statusText;
			this._data = JSON.parse(this._req.responseText);
			this._req = null;
			if (this._callback !== null) {
				this._callback.apply(global);
				this._callback = null;
			}
		}
	}

	constructor.prototype._commit = function() {
		if (this._disable_commit > 0)
			return;
		if (this.sugar) {
			var req = new ShockTherapySugarRequest();
			req.open("GET", "/ShockTherapyConfig.persist:" +
				JSON.stringify(this.exportConfig(), null, "\t"));
			req.send(null);
		}
	}

	constructor.prototype.getString = function(key, defValue)
	{
		var value;
		if (this.android)
		{
			value = global.Android.getItem(key);
			// The Android interface does not return the global null value.
			if (value == null)
				value = null;
		}
		else if (this.sugar)
		{
			if (this._data.hasOwnProperty(key))
				value = this._data[key];
			else
				value = null;
		}
		else
		{
			value = localStorage.getItem(this.prefix + key);
		}

		if (value === null)
			value = defValue;

		return value;
	}

	constructor.prototype.setString = function(key, value)
	{
		if (this.android)
		{
			global.Android.setItem(key, value);
		}
		else if (this.sugar)
		{
			this._data[key] = value;
			this._commit();

		}
		else
		{
			localStorage.setItem(this.prefix + key, value);
		}
	}

	constructor.prototype.remove = function(key)
	{
		if (this.android)
		{
			global.Android.remove(key);
		}
		else if (this.sugar)
		{
			delete this._data[key];
			this._commit();
		}
		else
		{
			localStorage.removeItem(this.prefix + key);
		}
	}

	constructor.prototype.clear = function(key)
	{
		this._disable_commit += 1;
		try {
			for (var i = 0; i < this._known_keys.length; i++)
				this.remove(this._known_keys[i]);
		}
		finally {
			this._disable_commit -= 1;
		}
		this._commit();
	}

	constructor.prototype.importConfig = function(config)
	{

		var importString = function(key) {
			if (config.hasOwnProperty(key)) {
				this.setString(key, config[key]);
			}
		}.bind(this);

		var importBoolean = function(key) {
			if (config.hasOwnProperty(key)) {
				var value = String(config[key]);
				if (value == "true" || value == "false") {
					this.setBoolean(key, value == "true");
				}
			}
		}.bind(this);

		var importFloat = function(key, min, max) {
			if (config.hasOwnProperty(key)) {
				var value = parseFloat(config[key]);
				if (!isNaN(value) && value >= min && value <= max) {
					this.setFloat(key, value);
				}
			}
		}.bind(this);

		var importColor = function(key) {
			if (config.hasOwnProperty(key)) {
				var color = new HslColor();
				try {
					color.setStyle(config[key]);
					this.setString(key, color.toStyle());
				}
				catch (e) {
				}
			}
		}.bind(this);

		this._disable_commit += 1;
		try {
			this.clear();
			importString("Theme");
			importBoolean("Sound");
			importFloat("SoundVolume", 0, 100);
			importBoolean("Vibrator");
			importFloat("VibratorIntensity", 0, 100);
			importColor("Color");
			importFloat("HueVariance", 0, 100);
			importFloat("BrightnessVariance", 0, 100);
			importFloat("Thickness", 0, 100);
			importFloat("Density", 0, 100);
			importFloat("Duration", 0, 100);
			importBoolean("MenuButton");
		}
		finally {
			this._disable_commit -= 1;
		}
		this._commit();
	}

	constructor.prototype.setBoolean = function(key, value)
	{
		if (value)
			value = "true";
		else
			value  = "false";

		this.setString(key, value);
	}

	constructor.prototype.setFloat = function(key, value)
	{
		value = new Number(value).toString();
		this.setString(key, value);
	}

	return constructor;

}(this));

});
