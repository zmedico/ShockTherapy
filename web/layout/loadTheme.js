
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
				var style = resources.getCss();
				if (style != null) {
					if (document.createStyleSheet) {
						// Microsoft Internet Explorer
						document.createStyleSheet().cssText = style;
					}
					else {
						var s = document.createElement("style");
						s.type = "text/css";
						s.appendChild(document.createTextNode(style));
						document.head.appendChild(s);
					}
				}
				if (document.readyState == "complete")
					callback.apply(global, [shockTherapyConfig,
						themeFactory, resources]);
				else
					document.addEventListener("readystatechange",
						function (e) {
							if (document.readyState == "complete")
								callback.apply(global, [shockTherapyConfig,
									themeFactory, resources]);
						}
					);
			});
		});

		});
	});

	}

	return loadTheme;

}(this));
