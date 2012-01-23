
require([
	"extend",
	"HslColor",
	"colorsys",
	"SliderDrawable"
], function() {

this.ColorSliderDrawable = (function() {

	var constructor = function(resources)
	{
		constructor.base.constructor.call(this, resources);
		this.edgePadding = 5;
		this.vertPaddingFactor = 1/5;
		this._background = null;
		this._color = null;
		this._coordinate = 0;
	}

	extend(SliderDrawable, constructor);

	Object.defineProperty(constructor.prototype, "color", {
		get : function () {
			return this._color;
		},
		set : function (val) {
			this._color = val;
			this._background = null;
		}
	});

	Object.defineProperty(constructor.prototype, "coordinate", {
		get : function () {
			return this._coordinate;
		},
		set : function (val) {
			this._coordinate = val;
			this._background = null;
		}
	});

	constructor.prototype.calcKnobWidth = function()
	{
		return this.bounds.h / 3;
	}

	constructor.prototype.draw = function(context)
	{
		var box = this.bounds;

		var canvasStyle = window.getComputedStyle(context.canvas);
		context.globalCompositeOperation = "source-over"
		context.beginPath();
		context.fillStyle = canvasStyle.getPropertyValue("background-color");
		context.fillRect(box.x, box.y, box.w, box.h);
		context.fill();
		context.closePath();

		var knobWidth = this.calcKnobWidth();
		var radius = Math.round(knobWidth / 2);
		var xMin = radius + this.edgePadding, xMax = box.w - radius - this.edgePadding;
		var bgWidth = box.w - 2 * (radius + this.edgePadding);

		var vertPadding = Math.round(this.vertPaddingFactor * box.h);
		var bgHeight = box.h - 2 * vertPadding;

		context.beginPath();
		context.fillStyle = "black";
		context.fillRect(box.x + xMin - 1, box.y + vertPadding - 1, bgWidth+2, bgHeight+2);
		context.fill();
		context.closePath();

		if (this._background === null ||
			this._background.width != bgWidth ||
			this._background.height != bgHeight) {

			this._background = context.createImageData(bgWidth, bgHeight);

			var imageData = this._background;
			var data = imageData.data;
			var colors = [];
			if (this._color === null)
				this._color = new HslColor(0.0, 1.0, 0.5);
			var color = this._color;
			var h = color.h, s = color.s, l = color.l;
			if (this._coordinate == 0)
				for (var x = 0; x < bgWidth; x++)
					colors.push(colorsys.hls_to_rgb(x / bgWidth, l, s));
			else if (this._coordinate == 1)
				for (var x = 0; x < bgWidth; x++)
					colors.push(colorsys.hls_to_rgb(h, l, x / bgWidth));
			else
				for (var x = 0; x < bgWidth; x++)
					colors.push(colorsys.hls_to_rgb(h, x / bgWidth, s));

			var color;
			var i = 0;
			for (var y = 0; y < bgHeight; y++)
				for (var x = 0; x < bgWidth; x++) {
					color = colors[x];
					// rgba
					data[i++] = color.r * 255;
					data[i++] = color.g * 255;
					data[i++] = color.b * 255;
					data[i++] = 255;
				}
		}
		context.putImageData(this._background, box.x + xMin, box.y + vertPadding);

		var ratio = this.model.value / (this.model.max - this.model.min);
		var x = Math.floor(xMin + ratio * (xMax - xMin));

		context.fillStyle = this.resources.getString("Slider.Knob.color");

		context.beginPath();
		context.moveTo(x, vertPadding-2);
		context.lineTo(x - radius, 0);
		context.lineTo(x + radius, 0);
		context.lineTo(x, vertPadding-2);
		context.fill();
		context.closePath();

		context.beginPath();
		context.moveTo(x, box.h - vertPadding+2);
		context.lineTo(x - radius, box.h - 1);
		context.lineTo(x + radius, box.h - 1);
		context.lineTo(x, box.h - vertPadding+2);
		context.fill();
		context.closePath();
	}

	return constructor;

}());

});
