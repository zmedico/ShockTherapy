
this.ShockTherapyConfig = (function(global) {

	var constructor = function(prefix)
	{
		this.prefix = prefix;
		this.android = / android:com\.googlecode\.electroshocktherapy$/.exec(
			global.window.navigator.userAgent) !== null;
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
		else
		{
			localStorage.removeItem(this.prefix + key);
		}
	}

	constructor.prototype.clear = function(key)
	{
		for (var i = 0; i < this._known_keys.length; i++)
			this.remove(this._known_keys[i]);
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
