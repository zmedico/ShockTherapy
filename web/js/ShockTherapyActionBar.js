
require([
	"createActionBarMenu",
	"elementContentOffset",
], function() {

this.ShockTherapyActionBar = (function(global) {

	var constructor = function() {
		var getElementById = global.window.document.getElementById.bind(
			global.window.document);
		this._container = getElementById("actionBar")
		this._upButton = getElementById("actionBarUpButton");
		this._upButtonIcon = getElementById("actionBarUpButtonIcon");
		this._title = getElementById("actionBarTitle");
		this._buttonPanel = getElementById("actionBarButtonPanel");
		this._overflowButton = getElementById("actionBarOverflowButton");
		this._overflowButtonListener = null;
	}

	constructor.prototype.show = function() {
		this._container.style.zIndex = 0;
	}

	constructor.prototype.hide = function() {
		this._container.style.zIndex = -1;
		if (this._overflowButtonListener !== null)
			this._overflowButtonListener.hideMenu();
	}

	constructor.prototype.setTitle = function(title) {
		while (this._title.firstChild)
			this._title.removeChild(this._title.firstChild);
		this._title.appendChild(
			this._title.ownerDocument.createTextNode(title));
	}

	var _loadLink = function(link) {
		// Use window.location.hash to avoid page reload.
		if (link.href != global.window.location.href) {
			var index, loc, newLoc;
			newLoc = false;
			loc = global.window.location.href;
			index = loc.indexOf("#");
			if (index > 0)
				loc = loc.substring(0, index);
			if (link.href.length >= loc.length &&
				link.href.substring(0, loc.length) == loc) {
				index = link.href.indexOf("#");
				if (index > 0) {
					if (index == loc.length)
						global.window.location.hash =
							link.href.substring(index);
					else
						newLoc = true;
				}
				else {
					if (link.href.length == loc.length)
						global.window.location.hash = "";
					else
						newLoc = true;
				}
			}
			else
				newLoc = true;

			if (newLoc)
				global.window.location.assign(link.href);
		}
		return false;
	}

	constructor.prototype.setUpButtonUri = function(uri) {
		if (uri) {
			this._upButton.href = uri;
			this._upButton.style.cursor = "pointer";
			this._upButton.onclick =
				_loadLink.bind(this, this._upButton);
			this._upButtonIcon.style.visibility = "visible";
		}
		else {
			this._upButton.href = "#";
			this._upButton.style.cursor = "default";
			this._upButton.onclick = function () { return false; };
			this._upButtonIcon.style.visibility = "hidden";
		}
	}

	var availableActions = {

		"Main" : function() {
			global.window.location.hash = "";
		},

		"Screen Saver" : function() {
			global.window.location.hash = "#screensaver";
		},

		"Options" : function() {
			global.window.location.hash = "#options";
		},

		"About" : function() {
			global.window.location.hash = "#about";
		}

	};

	constructor.prototype.setActions = function(actionNames) {
		var actions = [];
		for (var i = 0; i < actionNames.length; i++) {
			actions.push({
				name: actionNames[i],
				callback: availableActions[actionNames[i]]
			});
		}

		if (this._overflowButtonListener !== null)
			this._overflowButton.removeEventListener("click",
				this._overflowButtonListener);

		this._overflowButtonListener = createActionBarMenu(actions,
			this._positionActionMenu.bind(this));
		this._overflowButton.addEventListener("click",
			this._overflowButtonListener);
	}

	constructor.prototype._positionActionMenu = function(menu) {
		var buttonPanel = this._buttonPanel;
		var position = elementContentOffset(buttonPanel);
		position.y += buttonPanel.offsetHeight;
		// action bar border-width is 2px
		position.y += 2;
		position.x += buttonPanel.offsetWidth;
		position.x -= menu.container.offsetWidth;
		menu.container.style.setProperty("position", "fixed", null);
		menu.moveTo(position.x, position.y);
	}

	return constructor;

})(this);

});
