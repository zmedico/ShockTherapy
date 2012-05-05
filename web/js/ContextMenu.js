
require([
	"elementContentOffset",
	"ShockTherapy"
], function() {

this.ContextMenu = (function() {

	var constructor = function(container, parent)
	{
		this.container = container;
		this.parent = parent;
		this.container.setAttribute("class", "contextMenu");
		this._visible = false;
		this._boundBlurListener = this._blurListener.bind(this);
		this._blur_timeout = null;
		this._mobile = ShockTherapy.mobile || ShockTherapy.sugar;
	}

	constructor.prototype._blurListener = function(e) {
		this.parent.ownerDocument.removeEventListener(
			"touchstart", this._boundBlurListener, true);
		this.parent.ownerDocument.removeEventListener(
			"mousedown", this._boundBlurListener, true);
		if (this._visible) {
			/* Hide, but asynchronously since we want the current
			event to propagate first. Mobile browsers may need
			a longer timeout if they're slow. */
			var timeout;
			if (this._mobile)
				timeout = 750;
			else {
				this.container.style.setProperty("opacity", "0", null);
				timeout = 250;
			}
			this._blur_timeout =
				this.parent.ownerDocument.defaultView.setTimeout(
				this._blurTimeoutCb.bind(this), timeout);
		}
		return true;
	}

	constructor.prototype._blurTimeoutCb = function(e) {
		if (this._blur_timeout !== null) {
			this.parent.ownerDocument.defaultView.clearTimeout(
				this._blur_timeout)
			this._blur_timeout = null;
		}
		this.onblur();
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

	constructor.prototype.moveTo = function(x, y) {
		this.container.style.setProperty("left", x + "px", null);
		this.container.style.setProperty("top", y + "px", null);
	}

	constructor.prototype.show = function(position) {
		if (this._blur_timeout !== null) {
			this.parent.ownerDocument.defaultView.clearTimeout(
				this._blur_timeout)
			this._blur_timeout = null;
		}
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

}());

});
