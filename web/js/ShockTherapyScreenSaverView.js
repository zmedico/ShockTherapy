
require([
	"ShockTherapy"
], function() {

this.ShockTherapyScreenSaverView = (function(global) {

	var constructor = function(widget) {
		this._widget = widget;
		this._resizeTimeoutId = null;
		this._boundResizeListener = this._resizeListener.bind(this);
		this._boundResizeTimeout = this._resizeTimeout.bind(this);
		this._boundWidgetClickListener = this._widgetClickListener.bind(this);
		this._boundAnimate = this._animate.bind(this);
		this._boundWindowBlurListener = this._windowBlurListener.bind(this);
		this._boundWindowFocusListener = this._windowFocusListener.bind(this);
		this._animateTimeoutId = null;
	}

	constructor.prototype.display = function(container, callback) {
		this._widget.canvas.width = global.window.innerWidth;
		this._widget.canvas.height = global.window.innerHeight;
		this._widget.interactive = false;
		this._widget.canvas.addEventListener("contextmenu",
			this._boundWidgetClickListener);
		this._widget.canvas.addEventListener("click",
			this._boundWidgetClickListener);
		container.appendChild(this._widget.canvas);
		global.window.addEventListener("resize",
			this._boundResizeListener);
		ShockTherapy.focused = true;
		window.addEventListener("blur", this._boundWindowBlurListener);
		window.addEventListener("focus", this._boundWindowFocusListener);
		this._animate();
		if (callback)
			callback.apply(global);
	}

	constructor.prototype.undisplay = function() {
		this._widget.stop();
		if (this._animateTimeoutId !== null) {
			window.clearTimeout(this._animateTimeoutId)
			this._animateTimeoutId = null;
		}
		this._widget.canvas.removeEventListener("contextmenu",
			this._boundWidgetClickListener);
		this._widget.canvas.removeEventListener("click",
			this._boundWidgetClickListener);
		global.window.removeEventListener("resize",
			this._boundResizeListener);
		window.removeEventListener("blur", this._boundWindowBlurListener);
		window.removeEventListener("focus", this._boundWindowFocusListener);
	}

	constructor.prototype._resizeListener = function() {
		if (this._resizeTimeoutId === null)
		{
			this._resizeTimeoutId = global.window.setTimeout(
				this._boundResizeTimeout, 250);
		}
	}

	constructor.prototype._resizeTimeout = function() {
		this._widget.canvas.width = global.window.innerWidth;
		this._widget.canvas.height = global.window.innerHeight;
		this._resizeTimeoutId = null;
	}

	constructor.prototype._windowBlurListener = function() {
		ShockTherapy.focused = false;
		this._widget.stop();
	}

	constructor.prototype._windowFocusListener = function() {
		ShockTherapy.focused = true;
		this._animate();
	}

	constructor.prototype._exitScreenSaver = function() {
		if (this._animateTimeoutId !== null) {
			window.clearTimeout(this._animateTimeoutId);
			this._animateTimeoutId = null;
		}
		this._widget.stop();
		// switch to the interactive main view
		window.location.hash = "";
	}

	constructor.prototype._widgetClickListener = function(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		this._exitScreenSaver();
		return false;
	}

	constructor.prototype._animate = function() {
		if (!ShockTherapy.focused) {
			this._widget.stop();
			if (this._animateTimeoutId !== null) {
				window.clearTimeout(this._animateTimeoutId);
				this._animateTimeoutId = null;
			}
			return;
		}

		/** Ensure that we never have more than one timeout
		scheduled at a time. **/
		if (this._animateTimeoutId !== null)
			window.clearTimeout(this._animateTimeoutId)

		var widget = this._widget;
		if (widget.running) {
			widget.stop();
			this._animateTimeoutId = window.setTimeout(this._boundAnimate,
				500 + Math.round(500 * Math.random()));
		}
		else {
			var w = widget.canvas.width,
			h = widget.canvas.height,
			rand = w * h * Math.random(),
			y = rand / w,
			x = rand % w;
			widget.moveTarget(x, y);
			widget.start();
			this._animateTimeoutId = window.setTimeout(this._boundAnimate,
				Math.round(500 * Math.random()));
		}
	}

	return constructor;

})(this);

});
