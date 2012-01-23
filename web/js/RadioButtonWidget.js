
require([
	"CheckboxWidget",
	"extend",
], function() {

this.RadioButtonWidget = (function() {

	var constructor = function(element, resources)
	{
		constructor.base.constructor.call(this, element, resources);
	}

	extend(CheckboxWidget, constructor);

	constructor.prototype._drawableClass = "RadioButton.Class";

	return constructor;

}());
});
