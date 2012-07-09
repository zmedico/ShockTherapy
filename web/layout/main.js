
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"require",
		"ShockTherapy",
		"ShockTherapyDefaults"
	], function() {

	var getElementById, global;
	global = this;
	getElementById = global.window.document.getElementById.bind(
		global.window.document);

	var curtain = getElementById("curtain");
	var actionBar = null;
	var shockTherapyWidget = null;
	var contentDiv = getElementById("content");
	var mainView = null;
	var screenSaverView = null;
	var aboutView = null;
	var optionsView = null;
	var previousView = null;

	// Initialize default MenuButton setting.
	var menuButtonDefault = false;
	if (ShockTherapy.android &&
		!ShockTherapy.android.hardwareMenuButtonRequired())
		menuButtonDefault = true;
	else if (!ShockTherapy.android && ShockTherapy.mobile)
		/* This may be a touch-based browser without contextmenu,
		and since it's not our Android app, the menu isn't
		accessible via a hardware menu button. */
		menuButtonDefault = true;
	ShockTherapyDefaults.MenuButton = menuButtonDefault;

	var reloadTheme = function() {
		if (!curtain.parentNode)
			global.window.document.body.appendChild(curtain);
		resources.removeCssFromDoc();

		var profile = shockTherapyConfig.getString("Theme");
		if (profile === null ||
			!resourceFactory.listThemes().hasOwnProperty(profile))
			resources = resourceFactory.getDefault();
		else
			resources = resourceFactory.createObject(profile);

		resources.load(function () {
			resources.addCssToDoc();
			/* Discard optionsView since it holds
			references to the old theme resources. */
			optionsView = null;
			updateView();
		});
	}

	var initShockTherapyWidget = function() {
		var c = global.document.createElement("canvas");
		/*
		Prevent the "tap highlight" from showing inappropriately on the
		ShockTherapyWidget canvas. This problem has been observed
		intermittently with the Android 4.0.4 WebView widget, usually
		after an AJAX-based view switch.
		*/
		c.setAttribute("class", "fullscreen black noWebkitTapHighlight");
		c.width = global.window.innerWidth;
		c.height = global.window.innerHeight;
		shockTherapyWidget = new ShockTherapyWidget("..", shockTherapyConfig, c);
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
		else if (hash == "#screensaver") {
			if (screenSaverView === null) {
				require([
					"ShockTherapyScreenSaverView",
					"ShockTherapyWidget"
				], function() {
						if (shockTherapyWidget === null)
							initShockTherapyWidget();
						screenSaverView =
							new ShockTherapyScreenSaverView(shockTherapyWidget);
						callback.apply(global, [screenSaverView]);
					}
				);
			}
			else
				callback.apply(global, [screenSaverView]);
		}
		else {
			if (mainView === null) {
				require([
					"ShockTherapyMainView",
					"ShockTherapyWidget"
				], function() {
						if (shockTherapyWidget === null)
							initShockTherapyWidget();
						mainView = new ShockTherapyMainView(shockTherapyWidget);
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
