
require([
	"ContextMenu"
], function() {

this.createActionBarMenu = (function(global) {
	var createActionBarMenu = function(actions, positionMenu) {

		var doc = global.window.document;
		var menu = null;
		var menuVisible = false;

		var menuHide = function() {
			if (!menuVisible)
				return
			menuVisible = false;
			menu.onblur();
			doc.body.removeChild(menu.container);
		}

		var listener = function(e) {
			if (menu === null) {

				menu = new ContextMenu(doc.createElement("div"), doc.body);
				menu.container.setAttribute("class",
					"contextMenu actionBarMenu");

				var action, button, hr, i, d, s;
				for (i = 0; i < actions.length; i++) {
					action = actions[i];
					button = doc.createElement("button");
					button.setAttribute("class", "actionBarMenuButton");
					d = doc.createElement("div");
					d.setAttribute("class", "vertCenter");
					s = doc.createElement("span");
					s.appendChild(doc.createTextNode(action.name));
					d.appendChild(s);
					button.appendChild(d);
					button.addEventListener("click",
						(function(e) {
							menuHide();
							this.callback.apply(global);
						}).bind(action));
					menu.container.appendChild(button);

					if (i < actions.length - 1) {
						hr = doc.createElement("hr");
						hr.setAttribute("class", "actionBarMenuSeparator");
						menu.container.appendChild(hr);
					}
				}

			}

			if (menuVisible) {
				menuHide();
			}
			else {
				menuVisible = true;
				doc.body.appendChild(menu.container);
				positionMenu(menu);
				menu.show();
			}
		}

		listener.hideMenu = menuHide;

		return listener;
	}

	return createActionBarMenu;

})(this);

});
