
require([
	"ContextMenu",
	"createActionBarMenu",
	"elementContentOffset",
	"ShockTherapyDefaults",
], function() {

this.ShockTherapyMainView = (function(global) {

	var constructor = function(widget) {
		this._widget = widget;
		this._mainMenuButton =
			global.document.getElementById("mainMenuButton");
		this._mainMenuButton.addEventListener("click",
			this._mainMenuListener.bind(this));
		this._resize_timeout_id = null;
		this._bound_resize_listener = this._resize_listener.bind(this);
		this._bound_resize_timeout = this._resize_timeout.bind(this);
		this._boundContextMenuListener = this._contextMenuListener.bind(this);
		this._boundWidgetClickListener = this._widgetClickListener.bind(this);
		this._mainMenu = null;
		this._contextMenu = null;
	}

	var actions = [
		{
			name: "Options",
			callback: function() {
				global.window.location.hash = "#options";
			}
		},
		{
			name: "Screen Saver",
			callback: function() {
				global.window.location.hash = "#screensaver";
			}
		},
		{
			name: "About",
			callback: function() {
				global.window.location.hash = "#about";
			}
		}
	];

	constructor.prototype.display = function(container, callback) {
		this._widget.canvas.width = global.window.innerWidth;
		this._widget.canvas.height = global.window.innerHeight;
		this._widget.interactive = true;
		this._widget.canvas.addEventListener("contextmenu",
			this._boundContextMenuListener);
		this._widget.addEventListener("click",
			this._boundWidgetClickListener);
		container.appendChild(this._widget.canvas);
		global.window.addEventListener("resize",
			this._bound_resize_listener);
		if (this._widget.config.getBoolean("MenuButton",
			ShockTherapyDefaults.MenuButton))
			this._mainMenuButton.style.visibility = "visible";
		if (callback)
			callback.apply(global);
	}

	constructor.prototype.undisplay = function() {
		this._widget.canvas.removeEventListener("contextmenu",
			this._boundContextMenuListener);
		this._widget.removeEventListener("click",
			this._boundWidgetClickListener);
		global.window.removeEventListener("resize",
			this._bound_resize_listener);
		this._mainMenuButton.style.visibility = "hidden";
		if (this._mainMenu !== null)
			this._mainMenu.hideMenu();
		if (this._contextMenu !== null)
			this._contextMenu.onblur();
	}

	constructor.prototype._resize_listener = function() {
		if (this._resize_timeout_id === null)
		{
			this._resize_timeout_id = global.window.setTimeout(
				this._bound_resize_timeout, 250);
		}
	}

	constructor.prototype._resize_timeout = function() {
		this._widget.canvas.width = global.window.innerWidth;
		this._widget.canvas.height = global.window.innerHeight;
		this._resize_timeout_id = null;
	}

	constructor.prototype._mainMenuListener = function() {
		if (this._mainMenu === null)
			this._mainMenu = createActionBarMenu(actions,
				this._positionMainMenu.bind(this));
		this._mainMenu();
		return false;
	}

	constructor.prototype._widgetClickListener = function(e) {
		if (this._mainMenu !== null)
			this._mainMenu.hideMenu();
		if (this._contextMenu !== null)
			this._contextMenu.onblur();
	}

	constructor.prototype._contextMenuListener = function(e) {
		if (!this._widget.running) {
			if (this._contextMenu === null)
				this._initContextMenu();
			this._contextMenu.onContextMenu(e);
		}
	}

	constructor.prototype._initContextMenu = function() {
		var action, button, contextMenu, doc, hr, i, d, s,
			doc = global.window.document;
		contextMenu = new ContextMenu(
			global.window.document.createElement("div"), this._widget.canvas);
		this._contextMenu = contextMenu;

		contextMenu.container.setAttribute("class",
			"contextMenu actionBarMenu");

		for (i = 0; i < actions.length; i++) {
			action = actions[i];
			button = doc.createElement("a");
			button.href = "#";
			button.setAttribute("class", "actionBarMenuButton");
			d = doc.createElement("div");
			d.setAttribute("class", "vertCenter actionBarMenuButtonPadding");
			s = doc.createElement("span");
			s.appendChild(doc.createTextNode(action.name));
			d.appendChild(s);
			button.appendChild(d);
			button.onclick =
				(function(e) {
					contextMenu.onblur();
					this.callback.apply(global);
					return false;
				}).bind(action);
			contextMenu.container.appendChild(button);

			if (i < actions.length - 1) {
				hr = doc.createElement("hr");
				hr.setAttribute("class", "actionBarMenuSeparator");
				contextMenu.container.appendChild(hr);
			}
		}

		global.window.document.body.appendChild(contextMenu.container);
	}

	constructor.prototype._positionMainMenu = function(menu) {
		var button = this._mainMenuButton;
		var position = elementContentOffset(button);
		position.y += button.offsetHeight;
		position.x += button.offsetWidth;
		position.x -= menu.container.offsetWidth;
		menu.container.style.setProperty("position", "fixed", null);
		menu.moveTo(position.x, position.y);
	}

	return constructor;

})(this);

});
