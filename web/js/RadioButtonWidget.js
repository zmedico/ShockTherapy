
define("RadioButtonWidget", [
	"CheckboxWidget",
	"extend",
], function(CheckboxWidget, extend) {

	var constructor = function(element, resources)
	{
		constructor.base.constructor.call(this, element, resources);
	}

	extend(CheckboxWidget, constructor);

	constructor.prototype._drawableClass = "RadioButton.Class";

	return constructor;

});
