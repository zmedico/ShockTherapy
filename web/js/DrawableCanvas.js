
this.DrawableCanvas = (function() {

	var constructor = function(drawable, element)
	{
		this.drawable = drawable;
		this.canvas = this.replaceWithCanvas(element);
	}

	constructor.prototype._copy_attrs =
		["class", "height", "style", "width"];

	constructor.prototype.replaceWithCanvas = function(element)
	{
		var canvas = element;
		if (element.tagName.toLowerCase() != "canvas")
		{
			canvas = element.ownerDocument.createElement("canvas");
			canvas.id = element.id;
			// apply relevant layout/style info
			var i, value;
			for (i = 0; i < this._copy_attrs.length; i++) {
				value = element.getAttribute(this._copy_attrs[i]);
				if (value !== null)
					canvas.setAttribute(this._copy_attrs[i], value);
			}
			element.parentNode.replaceChild(canvas, element);
		}
		return canvas;
	}

	constructor.prototype.getContentBox = function()
	{
		return {
			x: 0,
			y: 0,
			w: this.canvas.clientWidth,
			h: this.canvas.clientHeight
		};
	}

	constructor.prototype.draw = function(context)
	{
		var box = this.getContentBox();
		if (box.h > 0 && box.w > 0) {
			this.canvas.width = box.w;
			this.canvas.height = box.h;
			this.drawable.setBounds(box);
			this.drawable.draw(context);
		}
	}

	constructor.prototype.repaint = function() {
		this.draw(this.canvas.getContext("2d"));
	}

	return constructor;

}());
