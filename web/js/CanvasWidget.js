
require([
	"elementContentOffset",
	"EventAdapter",
	"extend",
	"DrawableCanvas"
], function() {

this.CanvasWidget = (function() {

	var constructor = function(drawable, element)
	{
		constructor.base.constructor.call(this, drawable, element);
		this.enabled = true;
		this.eventListenerAdapter = new EventAdapter(this, this);
	}

	extend(DrawableCanvas, constructor);

	constructor.prototype.getEnabled = function() {
		return this.enabled;
	}

	constructor.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	}

	constructor.prototype.getPointerOffset = function(e) {
		var offset = elementContentOffset(this.canvas);
		return {x: e.pageX - offset.x, y: e.pageY - offset.y};
	}

	constructor.prototype.addEventListener = function(type, listener, useCapture) {
		this.eventListenerAdapter.addEventListener(type, listener, useCapture);
	}

	constructor.prototype.removeEventListener = function(type, listener, useCapture) {
		this.eventListenerAdapter.removeEventListener(type, listener, useCapture);
	}

	constructor.prototype.fireEvent = function(type) {
		this.eventListenerAdapter.fireEvent(type);
	}

	constructor.prototype.onMouseMove = function(e) {}

	constructor.prototype.onMouseDown = function(e) {}

	constructor.prototype.onMouseUp = function(e) {}

	constructor.prototype.onMouseOver = function(e) {}

	constructor.prototype.onMouseOut = function(e) {}

	constructor.prototype.onContextMenu = function(e) {}

	return constructor;

}());

});
