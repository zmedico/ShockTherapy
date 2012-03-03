
require([
	"EventAdapter",
	"extend"
], function() {

this.ModalDialog = (function() {

	var constructor = function(content, options)
	{
		constructor.base.constructor.call(this, this);
		this.content = content;
		if (!options)
			options = {};
		this.options = options;
		this.cancelled = null;
		this._visible_elements = [];
	}

	extend(EventAdapter, constructor);

	constructor.prototype.show = function()
	{
		var overlayElement = document.createElement("div");
		overlayElement.setAttribute("class", "dialogCurtain");

		var okButton = document.createElement("button");
		okButton.textContent = "OK";
		var cancelButton = document.createElement("button");
		cancelButton.textContent = "Cancel";
		okButton.setAttribute("class", "dialogButton dialogButtonRight");
		cancelButton.setAttribute("class", "dialogButton dialogButtonLeft");

		var dialogElement = document.createElement("div");
		dialogElement.setAttribute("class", "dialogWindow");
		if (this.options.hasOwnProperty("title")) {
			var header = document.createElement("div");
			header.textContent = this.options.title;
			header.setAttribute("class", "header dialogHeader");
			dialogElement.appendChild(header);
		}
		dialogElement.appendChild(this.content);
		dialogElement.appendChild(cancelButton);
		dialogElement.appendChild(okButton);

		// The clientWidth and clientHeight of dialogElement are
		// calculated as soon as it's appended to the body.
		var body = this.content.ownerDocument.body;
		body.appendChild(overlayElement);
		body.appendChild(dialogElement);
		var dialogWidth = dialogElement.clientWidth;
		var dialogHeight = dialogElement.clientHeight;

		dialogElement.style.setProperty("width", dialogWidth + "px", null);
		dialogElement.style.setProperty("height", dialogHeight + "px", null);

		// center the dialog
		var view = this.content.ownerDocument.defaultView;
		var vp = {
			x: view.pageXOffset,
			y: view.pageYOffset,
			w: view.innerWidth,
			h: view.innerHeight
		};

		if (dialogHeight < vp.h)
			dialogElement.style.setProperty("top",
				(vp.y + (vp.h - dialogHeight) / 2) + "px", null);
		else
			/* Since the dialog is taller than the viewport, align
			the bottom edge so the buttons are visible. */
			dialogElement.style.setProperty("top",
				(vp.y + (vp.h - dialogHeight)) + "px", null);

		dialogElement.style.setProperty("left",
			(vp.x + (vp.w - dialogWidth)/2) + "px", null);

		this._visible_elements.push(overlayElement);
		this._visible_elements.push(dialogElement);
		this._visible_elements.push(this.content);
		this.cancelled = false;
		var _this = this;
		var cleanup = function(e) {
			_this.hide();
			_this.fireEvent("click");
		}
		okButton.addEventListener("click", cleanup);
		cancelButton.addEventListener("click",
			function(e) {
				_this.cancelled = true;
				cleanup();
			});
	}

	constructor.prototype.hide = function()
	{
		var node;
		while (this._visible_elements.length > 0) {
			node = this._visible_elements.pop();
			if (node.parentNode)
				node.parentNode.removeChild(node);
		}
	}

	return constructor;

}());

});
