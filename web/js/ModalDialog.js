
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
		var cancelButton, div, doc, okButton, span;
		doc = this.content.ownerDocument
		var overlayElement = document.createElement("div");
		overlayElement.setAttribute("class", "dialogCurtain");

		okButton = doc.createElement("a");
		okButton.href = "#";
		okButton.setAttribute("class", "dialogButton dialogButtonRight vertCenter");
		div = doc.createElement("div");
		div.setAttribute("class", "vertCenter");
		span = doc.createElement("span");
		span.appendChild(doc.createTextNode("OK"));
		div.appendChild(span);
		okButton.appendChild(div);

		cancelButton = doc.createElement("a");
		cancelButton.href = "#";
		div = doc.createElement("div");
		div.setAttribute("class", "vertCenter");
		span = doc.createElement("span");
		span.appendChild(doc.createTextNode("Cancel"));
		div.appendChild(span);
		cancelButton.appendChild(div);
		
		cancelButton.setAttribute("class", "dialogButton dialogButtonLeft vertCenter");

		var dialogElement = document.createElement("div");
		dialogElement.setAttribute("class", "dialogWindow");
		if (this.options.hasOwnProperty("title")) {
			var header = document.createElement("div");
			header.textContent = this.options.title;
			header.setAttribute("class", "header dialogHeader");
			dialogElement.appendChild(header);
		}
		dialogElement.appendChild(this.content);
		div = doc.createElement("div");
		div.appendChild(cancelButton);
		div.appendChild(okButton);
		dialogElement.appendChild(div);

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
			return false;
		}
		okButton.onclick = cleanup;
		cancelButton.onclick =
			function(e) {
				_this.cancelled = true;
				cleanup();
				return false;
			};
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
