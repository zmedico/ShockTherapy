
define([
	"elementContentOffset"
], function(elementContentOffset) {

	var constructor = function(container, parent)
	{
		this.container = container;
		this.parent = parent;
		this.container.setAttribute("class", "contextMenu");
		this._visible = false;
		this._boundBlurListener = this._blurListener.bind(this);
	}

	constructor.prototype._blurListener = function(e) {
		this.parent.ownerDocument.removeEventListener(
			"touchstart", this._boundBlurListener, true);
		this.parent.ownerDocument.removeEventListener(
			"mousedown", this._boundBlurListener, true);
		if (!this._pointerEventIntersects(e)) {
			/* If the even lands outside the menu then we
			can blur it immediately. If it lands on the menu,
			then do nothing, sice if we hide the menu here
			then it can prevent the menu's event handler from
			being invoked. */
			this.onblur();
		}
		return true;
	}

	constructor.prototype.onContextMenu = function(e) {
		if (!this.container.parentNode)
			this.parent.ownerDocument.body.appendChild(this.container);
		this.container.style.setProperty("width",
			this.container.clientWidth + "px", null);
		this.container.style.setProperty("height",
			this.container.clientHeight + "px", null);
		var offset = elementContentOffset(this.parent);
		var position = {x: e.pageX - offset.x, y: e.pageY - offset.y};
		if (position.x + this.container.offsetWidth > this.parent.clientWidth)
			position.x = this.parent.clientWidth - this.container.offsetWidth;
		if (position.y + this.container.offsetHeight > this.parent.clientHeight)
			position.y = this.parent.clientHeight - this.container.offsetHeight;
		position.x += offset.x;
		position.y += offset.y;
		this.moveTo(position.x, position.y);
		this.show();
	}

	/* Returns true if the given pointer event intersects this.container, and
	false otherwise. Intersecton with the container does not guarantee that
	a menu item will be selected, since it's possible (though unlikey) for
	the event to land on a border between menu items. */
	constructor.prototype._pointerEventIntersects = function(e) {
		var offset = elementContentOffset(this.container);
		var events, i ,x, y;
		if (e.targetTouches) {
			events = [e];
			for (i = 0; i < e.targetTouches.length; i++)
				events.push(e.targetTouches[i]);
		}
		else
			events = [e];
		for (i = 0; i < events.length; i++) {
			e = events[i];
			if (!(e.which && e.which != 1)) {
				x = e.pageX - offset.x;
				y = e.pageY - offset.y;
				if (x >= 0 && x < this.container.offsetWidth &&
					y >= 0 && y < this.container.offsetHeight)
					return true;
			}
		}
		return false;
	}

	constructor.prototype.moveTo = function(x, y) {
		this.container.style.setProperty("left", x + "px", null);
		this.container.style.setProperty("top", y + "px", null);
	}

	constructor.prototype.show = function(position) {
		var body = this.parent.ownerDocument.body;
		if (!this.container.parentNode)
			body.appendChild(this.container);
		this.parent.ownerDocument.addEventListener(
			"touchstart", this._boundBlurListener, true);
		this.parent.ownerDocument.addEventListener(
			"mousedown", this._boundBlurListener, true);
		this.container.style.setProperty("opacity", "1", null);
		this.container.style.setProperty("visibility", "visible", null);
		this._visible = true;
	}

	constructor.prototype.onblur = function() {
		this.container.style.setProperty("visibility", "hidden", null);
		if (this.container.parentNode)
			this.container.parentNode.removeChild(this.container);
		this._visible = false;
	}

	return constructor;
});
