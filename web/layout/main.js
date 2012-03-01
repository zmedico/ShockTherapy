
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"require",
		"ShockTherapy"
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
		else if (!ShockTherapy.android && ShockTherapy.mobile) {
			/* This may be a touch-based browser without contextmenu,
			 and since it's not our Android app, the menu isn't
			 accessible via a hardware menu button. */
			enableMenuButton = true;
		}
		if (enableMenuButton)
			shockTherapyConfig.setBoolean("MenuButton", enableMenuButton);
	}

	var reloadTheme = function() {
		if (!curtain.parentNode)
			global.window.document.body.appendChild(curtain);
		resources.removeCssFromDoc();
		loadTheme("..", function (_shockTherapyConfig,
			_resourceFactory, _resources) {
			shockTherapyConfig = _shockTherapyConfig;
			resourceFactory = _resourceFactory;
			resources = _resources;
			/* Discard optionsView since it holds
			references to the old theme resources. */
			optionsView = null;
			updateView();
		});
	}

	var getView = function(hash, callback) {
		if (hash == "#about") {
			if (aboutView === null) {
				require([
					"ShockTherapyAboutView",
					"ShockTherapyActionBar"
				], function() {
						if (actionBar === null)
							actionBar = new ShockTherapyActionBar();
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
			if (optionsView === null) {
				require([
					"ShockTherapyActionBar",
					"ShockTherapyOptionsView"
				], function() {
						if (actionBar === null)
							actionBar = new ShockTherapyActionBar();
						optionsView = new ShockTherapyOptionsView(
							"options.html", actionBar, shockTherapyConfig,
							resourceFactory, resources, reloadTheme);
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
