
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
	var actionBar = new ShockTherapyActionBar();
	var contentDiv = getElementById("content");
	var mainView = null;
	var aboutView = null;
	var optionsView = null;

	var getView = function(hash, callback) {
		if (hash == "#about") {
			if (aboutView === null) {
				require(["ShockTherapyAboutView"], function() {
						aboutView = new ShockTherapyAboutView("about.html");
						callback.apply(global, [aboutView]);
					}
				);
			}
			else
				callback.apply(global, [aboutView]);
		}
		else if (hash == "#options") {
			if (optionsView === null) {
				require(["ShockTherapyOptionsView"], function() {
						optionsView = new ShockTherapyOptionsView(
							"options.html", shockTherapyConfig,
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
			if (!curtain.parentNone)
				global.window.document.body.appendChild(curtain);
			while (contentDiv.firstChild)
				contentDiv.removeChild(contentDiv.firstChild);
			view.display(contentDiv, function() {
					view.configureActionBar(actionBar);
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
