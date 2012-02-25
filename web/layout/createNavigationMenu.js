
require([
	"createActionBarMenu",
	"elementContentOffset",
], function() {

this.createNavigationMenu = (function(global) {

	var availableActions = {

		"Main" : function() {
			global.window.location.assign("main.html");
		},

		"Options" : function() {
			global.window.location.assign("options.html");
		},

		"About" : function() {
			global.window.location.assign("about.html");
		}

	};

	var createNavigationMenu = function(actionNames, buttonPanel) {

		var actions = [];
		for (var i = 0; i < actionNames.length; i++) {
			actions.push({
				name: actionNames[i],
				callback: availableActions[actionNames[i]]
			});
		}

		var positionMenu = function(menu) {
			var position = elementContentOffset(buttonPanel);
			position.y += buttonPanel.clientHeight;
			// action bar border-width is 2px
			position.y += 2;
			position.x += buttonPanel.clientWidth;
			position.x -= menu.container.clientWidth;
			menu.container.style.setProperty("position", "fixed", null);
			menu.moveTo(position.x, position.y);
		}

		return createActionBarMenu(actions, positionMenu);
	}

	return createNavigationMenu;

})(this);

});
