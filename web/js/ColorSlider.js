
require([
	"SliderWidget",
	"extend"
], function() {

this.ColorSlider = (function() {

	var constructor = function(element, resources)
	{
		constructor.base.constructor.call(this, element, resources);
	}

	extend(SliderWidget, constructor);

	constructor.prototype._drawable_key = "ColorSlider.Class";

	Object.defineProperty(constructor.prototype, "color", {
		get : function () {
			return this.drawable.color;
		},
		set : function (val) {
			this.drawable.color = val;
		}
	});

	Object.defineProperty(constructor.prototype, "coordinate", {
		get : function () {
			return this.drawable.coordinate;
		},
		set : function (val) {
			this.drawable.coordinate = val;
		}
	});

	return constructor;

}());

});
