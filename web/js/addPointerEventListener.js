
function addPointerEventListener(canvas, listener, useCapture)
{

	var callbacks = {};

	function _supressEvent(e) {
		 e.preventDefault();
		 e.stopPropagation();
		 return false;
	}

	callbacks.contextmenu = function(e) {
		if (listener.enabled) {
			listener.onContextMenu(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.mousedown = function(e) {
		if (listener.enabled) {
			listener.onMouseDown(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.mouseup = function(e) {
		if (listener.enabled) {
			listener.onMouseUp(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.mousemove = function(e) {
		if (listener.enabled) {
			listener.onMouseMove(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.mouseover = function(e) {
		if (listener.enabled) {
			listener.onMouseOver(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.mouseout = function(e) {
		if (listener.enabled) {
			listener.onMouseOut(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.touchstart = function(e) {
		if (listener.enabled) {
			if (e.targetTouches.length > 0) {
				listener.onMouseDown(
					e.targetTouches[e.targetTouches.length-1]);
			}
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.touchend = function(e) {
		if (listener.enabled) {
			listener.onMouseUp(e);
			return _supressEvent(e);
		}
		return true;
	}

	callbacks.touchmove = function(e) {
		if (listener.enabled) {
			if (e.targetTouches.length > 0) {
				listener.onMouseMove(
					e.targetTouches[e.targetTouches.length-1]);
			}
			return _supressEvent(e);
		}
		return true;
	}

	var keys = Object.keys(callbacks);
	for (var i = 0; i < keys.length; i++)
		canvas.addEventListener(keys[i], callbacks[keys[i]], false);

	var remove = function() {
		for (var i = 0; i < keys.length; i++)
			canvas.removeEventListener(keys[i], callbacks[keys[i]], false);
	}

	return remove;
}
