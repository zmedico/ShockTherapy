// example from https://developer.mozilla.org/en/DOM/event.initMouseEvent
this.simulateClick = (function() {
	var simulateClick = function(element) {
		var event = element.ownerDocument.createEvent("MouseEvents");
		event.initMouseEvent("click", true, true,
			element.ownerDocument.defaultView,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		return element.dispatchEvent(event);
	};
	return simulateClick;
}());
