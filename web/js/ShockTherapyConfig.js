
this.ShockTherapyConfig = (function(global) {

	var constructor = function(prefix, callback)
	{
		this.prefix = prefix;
		this.android = / android:com\.googlecode\.electroshocktherapy$/.exec(
			global.window.navigator.userAgent) !== null;
		this.sugar = / sugar:com\.googlecode\.electroshocktherapy$/.exec(
			global.window.navigator.userAgent) !== null;
		this._callback = callback;
		this._data = null;
		this._req = null;
		this._disable_commit = 0;
		if (this.sugar) {
			this._load();
		}
		else {
			this._callback.apply(global);
			this._callback = null;
		}
	}

	constructor.prototype._known_keys = [
		"BrightnessVariance",
		"Color",
		"Density",
		"Duration",
		"HueVariance",
		"Sound",
		"SoundVolume",
		"Theme",
		"Thickness",
		"Vibrator",
		"VibratorIntensity"
	];

	constructor.prototype._load = function() {
		global.shockTherapyConfigLoad = this._loadComplete.bind(this);
		var title = global.document.title;
		global.document.title = "ShockTherapyConfig.load:";
		global.document.title = title;
	}

	constructor.prototype._loadComplete = function(data) {
		delete global.shockTherapyConfigLoad;
		this._data = JSON.parse(data);
		this._callback.apply(global);
		this._callback = null;
	}

	constructor.prototype._commit = function() {
		if (this._disable_commit > 0)
			return;
		if (this.sugar) {
			var title = global.window.document.title;
			global.window.document.title = "ShockTherapyConfig.persist:" +
				JSON.stringify(this.exportConfig(), null, "\t");
			global.window.document.title = title;
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

	constructor.prototype.exportConfig = function() {
		var config, value;
		config = {};
		for (var i = 0; i < this._known_keys.length; i++) {
			value = this.getString(this._known_keys[i], null);
			if (value !== null)
				config[this._known_keys[i]] = value;
		}
		return config;
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
		}
		finally {
			this._disable_commit -= 1;
		}
		this._commit();
	}

	constructor.prototype.getBoolean = function(key, defValue)
	{
		var value = this.getString(key, null);

		if (value === null)
			value = defValue;
		else
			value = value == "true";
		return value;
	}

	constructor.prototype.setBoolean = function(key, value)
	{
		if (value)
			value = "true";
		else
			value  = "false";

		this.setString(key, value);
	}

	constructor.prototype.getFloat = function(key, defValue)
	{
		var value = this.getString(key, null);

		if (value === null)
			value = defValue;
		else
			value = parseFloat(value);
		return value;
	}

	constructor.prototype.setFloat = function(key, value)
	{
		value = new Number(value).toString();
		this.setString(key, value);
	}

	return constructor;

}(this));
