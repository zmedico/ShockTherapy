
require([
	"HslColor",
	"ColorSlider"
], function() {

this.ColorChooser = (function() {

	var constructor = function(container, resources)
	{
		this.container = container;
		this.resources = resources;
		this._colorSwatch = null;
		this._hueSlider = null;
		this._saturationSlider = null;
		this._lightnessSlider = null;
		this._timeout = null;
		this._populate();
	}

	constructor.prototype._populate = function() {
		var createElement = this.container.ownerDocument.createElement.bind(
			this.container.ownerDocument);
		this._colorSwatch = createElement("div");
		var sliderPanel = createElement("div");
		this.container.appendChild(this._colorSwatch);
		this.container.appendChild(sliderPanel);

		this._colorSwatch.setAttribute("class",
			"colorChooserSwatch");

		var hueSlider = new ColorSlider(
			createElement("canvas"), this.resources);
		this._hueSlider = hueSlider;
		hueSlider.coordinate = 0;
		hueSlider.canvas.setAttribute("class",
			"slider colorSliderHorizontal dialogWidth");
		sliderPanel.appendChild(hueSlider.canvas);

		var saturationSlider = new ColorSlider(
			createElement("canvas"), this.resources);
		this._saturationSlider = saturationSlider;
		saturationSlider.coordinate = 1;
		saturationSlider.canvas.setAttribute("class",
			"slider colorSliderHorizontal dialogWidth");
		sliderPanel.appendChild(saturationSlider.canvas);

		var lightnessSlider = new ColorSlider(
			createElement("canvas"), this.resources);
		this._lightnessSlider = lightnessSlider;
		lightnessSlider.coordinate = 2;
		lightnessSlider.canvas.setAttribute("class",
			"slider colorSliderHorizontal dialogWidth");
		sliderPanel.appendChild(lightnessSlider.canvas);

		var change = this._change.bind(this);

		hueSlider.addEventListener("change", change);
		saturationSlider.addEventListener("change", change);
		lightnessSlider.addEventListener("change", change);
	}

	constructor.prototype._change = function() {
		if (this._timeout === null)
			this._timeout =
				this.container.ownerDocument.defaultView.setTimeout(
					this._change_timeout.bind(this), 100);
	}

	constructor.prototype._change_timeout = function() {
		this._timeout = null;
		this.setColor(this.getColor());
	}

	constructor.prototype.setColor = function(color) {
		var c = new HslColor();
		c.setStyle(color);

		this._hueSlider.color = c;
		this._hueSlider.value = c.h * 100.0;

		this._saturationSlider.color = c;
		this._saturationSlider.value = c.s * 100.0;

		this._lightnessSlider.color = c;
		this._lightnessSlider.value = c.l * 100.0;

		/* setProperty does not dynamically update the style
		 * with Microsoft Internet Explorer 9.0:
		 * this._colorSwatch.style.setProperty("background-color", color, null);
		 */
		this._colorSwatch.style.backgroundColor = color;
	}

	constructor.prototype.getColor = function() {
		return "hsl(" + this._hueSlider.value * 3.6 + "," +
			this._saturationSlider.value + "%," +
			this._lightnessSlider.value + "%)"
	}

	constructor.prototype.show = function() {
		this.setColor(this.getColor());
		this._hueSlider.repaint();
		this._saturationSlider.repaint();
		this._lightnessSlider.repaint();
	};

	return constructor;

}());

});
