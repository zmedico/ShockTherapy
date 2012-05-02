
require([
	"RadioButtonWidget",
	"extend",
], function() {

this.RadioGroupWidget = (function() {

	var constructor = function(container, resources, choices) {
		this.container = container;
		this.resources = resources;
		this.choices = choices;
		this._selection = null;
		this._buttons = null;
		this._createButtons();
	}

	constructor.prototype._createButtons = function() {
		var b, c, createElement, d, e, keys;
		createElement = this.container.ownerDocument.createElement.bind(
			this.container.ownerDocument);

		this._buttons = [];

		for (i = 0; i < this.choices.length; i++) {
			b = createElement("a");
			b.href = "#";
			b.setAttribute("class", "dialogRadioButtonList dialogWidth");

			d = createElement("div");
			d.setAttribute("class", "vertCenter wide");
			e = createElement("span");
			e.setAttribute("class", "option_title");
			e.appendChild(e.ownerDocument.createTextNode(this.choices[i]));
			d.appendChild(e);
			b.appendChild(d);

			d = createElement("div");
			d.setAttribute("class", "vertCenter")
			c = new RadioButtonWidget(
				createElement("canvas"), this.resources);
			this._buttons.push(c);
			c.setEnabled(false); // parent button handles clicks
			d.appendChild(c.canvas);
			b.appendChild(d);

			b.onclick = this._select.bind(this, i);

			this.container.appendChild(b);

			if (i < this.choices.length - 1) {
				e = createElement("hr");
				e.setAttribute("class", "listViewBorder");
				this.container.appendChild(e);
			}
		}
	}

	Object.defineProperty(constructor.prototype, "selection", {
		get : function() {
			return this._selection;
		},
		set : function(val) {
			this._select(val);
		}
	});

	constructor.prototype._select = function(i) {
		if (this._selection != i) {
			this._selection = i;
			for (i = 0; i < this._buttons.length; i++)
				this._buttons[i].checked = i == this._selection;
		}
		return false;
	}

	return constructor;

}());

});
