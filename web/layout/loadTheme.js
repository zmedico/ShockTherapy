
this.loadTheme = (function(global) {

	var loadTheme = function(uri, callback) {

	require([
		"ShockTherapyConfig",
		"ThemeFactory"
	], function() {

		var shockTherapyConfig = new ShockTherapyConfig("shockTherapy");
		shockTherapyConfig.load(
		function() {

		var themeFactory = new ThemeFactory(uri);
		themeFactory.load(function() {
			var profile, resources;
			profile = shockTherapyConfig.getString("Theme");
			if (profile === null ||
				!themeFactory.listThemes().hasOwnProperty(profile))
				resources = themeFactory.getDefault();
			else
				resources = themeFactory.createObject(profile);
			resources.load(function() {
				var document = global.window.document;
				resources.addCssToDoc();
				if (document.readyState == "complete")
					callback.apply(global, [shockTherapyConfig,
						themeFactory, resources]);
				else {
					var listener;
					document.addEventListener("readystatechange",
						listener = (function (e) {
							if (document.readyState == "complete") {
								document.removeEventListener(
									"readystatechange", listener);
								callback.apply(global, [shockTherapyConfig,
									themeFactory, resources]);
							}
						})
					);
				}
			});
		});

		});
	});

	}

	return loadTheme;

}(this));
