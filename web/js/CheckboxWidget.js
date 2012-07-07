
require([
	"addPointerEventListener",
	"CanvasWidget",
	"CheckboxModel",
	"extend",
], function() {

this.CheckboxWidget = (function() {

	var constructor = function(element, resources)
	{
		this.resources = resources;
		this.model = new CheckboxModel();
		var drawable = resources.createObject(this._drawableClass);
		drawable.model = this.model;
		constructor.base.constructor.call(this, drawable, element);
		addPointerEventListener(this.canvas, this);
		var classAttr = this.canvas.getAttribute("class");
		if (classAttr !== null)
			classAttr = this._cssClass + " " + classAttr;
		else
			classAttr = this._cssClass;
		this.canvas.setAttribute("class", classAttr);
	}

	extend(CanvasWidget, constructor);

	constructor.prototype._cssClass = "checkboxCanvas";
	constructor.prototype._drawableClass = "Checkbox.Class";

	Object.defineProperty(constructor.prototype, "checked", {
		get : function () {
			return this.model.checked;
		},
		set : function (val) {
			this.model.checked = val;
			this.repaint();
		}
	});

	constructor.prototype.click = function() {
		this.checked = !this.checked;
		if (this.enabled)
			this.fireEvent("click");
	}

	constructor.prototype.onMouseDown = function(e) {
		if (this.enabled)
			this.click();
	}

	constructor.prototype.repaint = function()
	{
		this.draw(this.canvas.getContext("2d"));
	}

	constructor.prototype.draw = function(context) {
		this.drawable.checked = this.checked;
		constructor.base.draw.call(this, context);
	}

	return constructor;

}());

});
