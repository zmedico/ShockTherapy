
require([
	"addPointerEventListener",
	"CanvasWidget",
	"extend",
	"SliderModel"
], function() {

this.SliderWidget = (function() {

	var constructor = function(element, resources)
	{
		this.resources = resources;
		this.adjusting = false;
		this.model = new SliderModel();
		var drawable = resources.createObject(this._drawable_key);
		drawable.model = this.model;
		constructor.base.constructor.call(this, drawable, element);
		addPointerEventListener(this.canvas, this);
		this._uncapture = null;
	}

	extend(CanvasWidget, constructor);

	constructor.prototype._drawable_key = "Slider.Class";

	Object.defineProperty(constructor.prototype, "min", {
		get : function () {
			return this.model.min;
		},
		set : function (val) {
			this.model.min = val;
		}
	});

	Object.defineProperty(constructor.prototype, "max", {
		get : function () {
			return this.model.max;
		},
		set : function (val) {
			this.model.max = val;
		}
	});

	Object.defineProperty(constructor.prototype, "value", {
		get : function () {
			return this.model.value;
		},
		set : function (val) {
			this.setValue(val);
		}
	});

	Object.defineProperty(constructor.prototype, "step", {
		get : function () {
			return this.model.step;
		},
		set : function (val) {
			this.model.step = val;
		}
	});

	constructor.prototype.setValue = function(value) {
		value = Math.floor(value);
		this.model.value = value;
		this.repaint();
	}

	constructor.prototype.moveTarget = function(e)
	{
		this.setValue(this.drawable.mapValueFromPointer(
			this.getPointerOffset(e)));
		this.fireEvent("change");
	}

	constructor.prototype.onMouseDown = function(e) {
		this.adjusting = true;
		if (this._uncapture === null)
			this._uncapture = addPointerEventListener(
				this.canvas.ownerDocument.body, this);
		this.moveTarget(e);
	}

	constructor.prototype.onMouseMove = function(e)
	{
		if (this.adjusting)
			this.moveTarget(e);
	}

	CanvasWidget.prototype.onMouseUp = function(e) {
		this.adjusting = false;
		if (this._uncapture !== null) {
			this._uncapture();
			this._uncapture = null;
		}
		this.fireEvent("click");
	}

	return constructor;

}());

});
