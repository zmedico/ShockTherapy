
this.EventAdapter = (function(global) {
	var constructor = function(source)
	{
		this.source = source;
		this.listeners = {};
	}

	constructor.prototype.addEventListener = function(type, listener, useCapture)
	{
		if (!this.listeners.hasOwnProperty(type))
			this.listeners[type] = [];
		this.listeners[type].push(listener);
	}

	constructor.prototype.removeEventListener = function(type, listener, useCapture)
	{
		if (this.listeners.hasOwnProperty(type)) {
			var relevantListeners = this.listeners[type];
			for (var i = 0; i < relevantListeners.length; i++)
				if (relevantListeners[i] === listener) {
					while (i + 1 < relevantListeners.length) {
						relevantListeners[i] = relevantListeners[i + 1];
						i++;
					}
					relevantListeners.pop();
					if (relevantListeners.length == 0)
						delete this.listeners[type];
					break
				}
		}
	}

	constructor.prototype.fireEvent = function(type) {
		if (this.listeners.hasOwnProperty(type)) {
			var relevantListeners = this.listeners[type];
			var e = document.createEvent("UIEvents");
			e.initUIEvent(type, true, true, global.window, 1);
			for (var i = 0; i < relevantListeners.length; i++)
				relevantListeners[i].call(this.source, e);
		}
	}

	return constructor;
}(this));
