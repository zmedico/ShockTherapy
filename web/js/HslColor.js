
require([
	"colorsys"
], function() {

this.HslColor = (function() {

	/*
	 * Values are 0.0 to 1.0.
	 */
	var constructor = function(h, s, l)
	{
		this.h = h;
		this.s = s;
		this.l = l;
	}

	// hsl(360.0,100.0%,100.0%)
	constructor.styleRegex = /^\s*hsl\(\s*(\d+(.\d+)?)\s*,\s*(\d+(.\d+)?)%\s*,\s*(\d+(.\d+)?)%\s*\)\s*$/;

	/*
	 * h 0.0 to 360.0 degrees
	 * s 0.0 to 100.0 percent
	 * l 0.0 to 100.0 percent
	 */
	constructor.prototype.setStyle = function(style)
	{
		var match = constructor.styleRegex.exec(style);
		if (match === null)
			throw "Invalid style: " + style;

		this.h = parseFloat(match[1]) / 360.0;
		this.s = parseFloat(match[3]) / 100.0;
		this.l = parseFloat(match[5]) / 100.0;
	}

	constructor.prototype.toStyle = function()
	{
		return "hsl(" + (this.h * 360.0) + "," + (this.s * 100.0) + "%," + (this.l * 100.0) + "%)";
	}

	constructor.prototype.toRgbStyle = function()
	{
		var rgb = colorsys.hls_to_rgb(this.h, this.l, this.s);
		return "rgb(" + (rgb.r * 100.0) + "%," + (rgb.g * 100.0) + "%," + (rgb.b * 100.0) + "%)";
	}

	constructor.prototype.copy = function()
	{
		return new constructor(this.h, this.s, this.l);
	}

	return constructor;

}());

});
