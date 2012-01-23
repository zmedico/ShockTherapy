
require([
	"elementContentOffset",
], function() {

this.ContextMenu = (function() {

	var constructor = function(container, parent)
	{
		this.container = container;
		this.parent = parent;
		this.container.setAttribute("class", "contextMenu");
	}

	constructor.prototype.onContextMenu = function(e) {
		this.container.style.setProperty("width",
			this.container.clientWidth + "px", null);
		this.container.style.setProperty("height",
			this.container.clientHeight + "px", null);
		var offset = elementContentOffset(this.parent);
		var position = {x: e.pageX - offset.x, y: e.pageY - offset.y};
		if (position.x + this.container.clientWidth > this.parent.clientWidth)
			position.x = this.parent.clientWidth - this.container.clientWidth;
		if (position.y + this.container.clientHeight > this.parent.clientHeight)
			position.y = this.parent.clientHeight - this.container.clientHeight;
		position.x += offset.x;
		position.y += offset.y;
		this.container.style.setProperty("left", position.x + "px", null);
		this.container.style.setProperty("top", position.y + "px", null);
		this.container.style.setProperty("visibility", "visible", null);
	}

	constructor.prototype.onblur = function() {
		this.container.style.setProperty("visibility", "hidden", null);
	}

	return constructor;

}());

});
