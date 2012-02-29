
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"ContextMenu",
		"require",
		"ShockTherapy",
		"ShockTherapyActionBar"
	], function() {

	var getElementById, global;
	global = this;
	getElementById = global.window.document.getElementById.bind(
		global.window.document);

	var curtain = getElementById("curtain");
	var actionBar = null;
	var contentDiv = getElementById("content");
	var mainView = null;
	var aboutView = null;
	var optionsView = null;
	var previousView = null;

	var enableMenuButton = shockTherapyConfig.getBoolean("MenuButton", null);
	if (enableMenuButton === null) {
		/* If there is no MenuButton user preference, then create a
		 * suitable default setting.
		 */
		if (ShockTherapy.android &&
			!ShockTherapy.android.hardwareMenuButtonRequired())
			enableMenuButton = true;
		else if (ShockTherapy.mobile) {
			// may be a touch-based browser without contextmenu
			enableMenuButton = true;
		}
		if (enableMenuButton)
			shockTherapyConfig.setBoolean("MenuButton", enableMenuButton);
	}

	var getView = function(hash, callback) {
		if (hash == "#about") {
			if (actionBar === null)
				actionBar = new ShockTherapyActionBar();
			if (aboutView === null) {
				require(["ShockTherapyAboutView"], function() {
						aboutView =
							new ShockTherapyAboutView("about.html", actionBar);
						callback.apply(global, [aboutView]);
					}
				);
			}
			else
				callback.apply(global, [aboutView]);
		}
		else if (hash == "#options") {
			if (actionBar === null)
				actionBar = new ShockTherapyActionBar();
			if (optionsView === null) {
				require(["ShockTherapyOptionsView"], function() {
						optionsView = new ShockTherapyOptionsView(
							"options.html", actionBar, shockTherapyConfig,
							resourceFactory, resources);
						callback.apply(global, [optionsView]);
					}
				);
			}
			else
				callback.apply(global, [optionsView]);
		}
		else {
			if (mainView === null) {
				require(["ShockTherapyMainView"], function() {
						mainView = new ShockTherapyMainView(shockTherapyConfig);
						callback.apply(global, [mainView]);
					}
				);
			}
			else
				callback.apply(global, [mainView]);
		}
	}

	var updateView = function() {
		getView(global.window.location.hash, function(view) {
			if (!curtain.parentNode)
				global.window.document.body.appendChild(curtain);
			while (contentDiv.firstChild)
				contentDiv.removeChild(contentDiv.firstChild);
			if (previousView != null)
				previousView.undisplay();
			previousView = view;
			view.display(contentDiv, function() {
					global.window.document.body.removeChild(curtain);
					ShockTherapy.viewChanged(global.window.location.href);
				}
			);
		});
	}

	global.window.addEventListener("hashchange", updateView, false);
	updateView();

	});
});
