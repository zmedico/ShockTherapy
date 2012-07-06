
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {
		require([
			"DrawableCanvas",
			"colorsys"
		], function() {

			this.RainbowDrawable = (function() {
				var constructor = function() {
					this._imageData = null;
				}

				constructor.prototype.setBounds = function(bounds)
				{
					this.bounds = bounds;
				}

				constructor.prototype.getBounds = function()
				{
					return this.bounds;
				}

				constructor.prototype.draw = function(context)
				{
					var box = this.bounds;
					if (this._imageData === null ||
						this._imageData.width != box.w ||
						this._imageData.height != box.h)
						this._imageData = context.createImageData(box.w, box.h);
					var imageData = this._imageData;
					var data = imageData.data;
					var colors = [];
					for (var x = 0; x < box.w; x++)
						colors.push(colorsys.hls_to_rgb(x / box.w, 0.5, 1.0));
					var color;
					var i = 0;
					for (var y = 0; y < box.h; y++)
						for (var x = 0; x < box.w; x++) {
							color = colors[x];
							// rgba
							data[i++] = color.r * 255;
							data[i++] = color.g * 255;
							data[i++] = color.b * 255;
							data[i++] = 255;
						}

					context.putImageData(imageData, box.x, box.y);
				}

				return constructor;
			}());

			var drawableCanvas = new DrawableCanvas(
				new RainbowDrawable(), document.getElementById("drawableCanvas"));
			drawableCanvas.repaint();
		});
});
