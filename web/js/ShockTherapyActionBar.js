
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
	}

	constructor.prototype.setTitle = function(title) {
		while (this._title.firstChild)
			this._title.removeChild(this._title.firstChild);
		this._title.appendChild(
			this._title.ownerDocument.createTextNode(title));
	}

	constructor.prototype.setUpButtonUri = function(uri) {
		if (uri) {
			this._upButton.href = uri;
			this._upButton.style.cursor = "pointer";
			this._upButton.onclick = null;
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
			global.window.location.assign("main.html");
		},

		"Options" : function() {
			global.window.location.assign("main.html#options");
		},

		"About" : function() {
			global.window.location.assign("main.html#about");
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
		position.y += buttonPanel.clientHeight;
		// action bar border-width is 2px
		position.y += 2;
		position.x += buttonPanel.clientWidth;
		position.x -= menu.container.clientWidth;
		menu.container.style.setProperty("position", "fixed", null);
		menu.moveTo(position.x, position.y);
	}

	return constructor;

})(this);

});
