
this.ShockTherapyReadonlyConfig = (function(global) {

	var constructor = function(data)
	{
		this._data = data;
	}

	constructor.prototype._known_keys = [
		"BrightnessVariance",
		"Color",
		"Density",
		"Duration",
		"HueVariance",
		"MenuButton",
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
		if (this._data.hasOwnProperty(key))
			value = this._data[key];
		else
			value = null;

		if (value === null)
			value = defValue;

		return value;
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

	constructor.prototype.getBoolean = function(key, defValue)
	{
		var value = this.getString(key, null);

		if (value === null)
			value = defValue;
		else
			value = value == "true";
		return value;
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

	return constructor;

}(this));
