
require([
	"ContextMenu"
], function() {

this.createActionBarMenu = (function(global) {
	var createActionBarMenu = function(actions, positionMenu) {

		var doc = global.window.document;
		var menu = null;

		var listener = function(e) {
			if (menu === null) {

				menu = new ContextMenu(doc.createElement("div"), doc.body);
				menu.container.setAttribute("class",
					"contextMenu actionBarMenu");

				var action, button, hr, i, d, s;
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
							menu.onblur();
							this.callback.apply(global);
							return false;
						}).bind(action);
					menu.container.appendChild(button);

					if (i < actions.length - 1) {
						hr = doc.createElement("hr");
						hr.setAttribute("class", "actionBarMenuSeparator");
						menu.container.appendChild(hr);
					}
				}

			}

			if (!menu._visible) {
				if (!menu.container.parentNode)
					menu.parent.ownerDocument.body.appendChild(menu.container);
				positionMenu(menu);
				menu.show();
			}
		}

		listener.hideMenu = (function() {
			if (menu !== null)
				menu.onblur();
		});

		return listener;
	}

	return createActionBarMenu;

})(this);

});
