
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	var createElement, getElementById, global;
	global = this;
	createElement = global.window.document.createElement.bind(
		global.window.document);
	getElementById = global.window.document.getElementById.bind(
		global.window.document);

	require([
		"CheckboxWidget",
		"ColorChooser",
		"ModalDialog",
		"openFileDialog",
		"saveUrl",
		"RadioGroupWidget",
		"ShockTherapyDefaults",
		"SliderWidget",
		"ThemeFactory",
	], function() {

	function sliderDialog(button, title, key)
	{
		var content, dialog, slider;
		content = createElement("div");
		var slider = new SliderWidget(
			createElement("canvas"), resources);
		slider.canvas.setAttribute("class",
			"slider sliderHorizontal dialogWidth");
		content.appendChild(slider.canvas);
		var dialog = new ModalDialog(content, {title: title});
		button.addEventListener("click",
			function(e) {
				dialog.addEventListener("click",
					function(e) {
						if (!dialog.cancelled)
						{
							shockTherapyConfig.setFloat(
								key, slider.value);
						}
					}
				)
				dialog.show();
				slider.setValue(shockTherapyConfig.getFloat(key,
					ShockTherapyDefaults[key]));
			});
	}

	function checkboxButton(button, checkboxCanvas, key)
	{
		var checkbox = new CheckboxWidget(checkboxCanvas, resources);
		checkbox.setEnabled(false); // parent button handles clicks
		checkbox.checked =
			shockTherapyConfig.getBoolean(key, ShockTherapyDefaults[key]);
		button.addEventListener("click",
			function(e) {
				checkbox.checked = !checkbox.checked;
				shockTherapyConfig.setBoolean(key,
					checkbox.checked);
			});
	}

	var themeButton = getElementById("themeButton");

	themeButton.addEventListener("click",
		function(e) {
			var radioGroup, choices, container, dialog, i, keys, themes;
			themes = resourceFactory.listThemes();
			container = createElement("div");
			choices = [];
			keys = Object.keys(themes);
			for (i = 0; i < keys.length; i++)
				choices.push(themes[keys[i]].name);

			radioGroup = new RadioGroupWidget(container, resources, choices);

			dialog = new ModalDialog(container, {title: "Theme"});
			dialog.addEventListener("click",
				function(e) {
					if (!dialog.cancelled && radioGroup.selection != null &&
						keys[radioGroup.selection] != resources.getProfileKey())
					{
						shockTherapyConfig.setString(
							"Theme", keys[radioGroup.selection]);
						global.window.location.reload();
					}
				}
			)

			dialog.show();
			for (i = 0; i < keys.length; i++)
				if (keys[i] == resources.getProfileKey()) {
					radioGroup.selection = i;
					break;
				}
		});

	checkboxButton(getElementById("soundButton"),
		getElementById("soundCheckbox"), "Sound");

	sliderDialog(getElementById("soundVolume"),
		"Sound Volume", "SoundVolume");

	checkboxButton(getElementById("vibratorButton"),
		getElementById("vibratorCheckbox"), "Vibrator");

	sliderDialog(getElementById("vibratorIntensity"),
		"Vibrator Intensity", "VibratorIntensity");

	var sparkColor = getElementById("sparkColor");

	sparkColor.addEventListener("click",
		function(e) {
			var content = createElement("div");
			content.setAttribute("class", "dialogWidth");
			var colorChooser = new ColorChooser(content, resources);
			var dialog = new ModalDialog(content, {title: "Spark Color"});
			dialog.addEventListener("click",
				function(e) {
					if (!dialog.cancelled)
					{
						shockTherapyConfig.setString("Color",
							colorChooser.getColor());
					}
				}
			)
			dialog.show();
			colorChooser.setColor(shockTherapyConfig.getString("Color",
				ShockTherapyDefaults["Color"]));
		});

	sliderDialog(getElementById("sparkHueVariance"),
		"Hue Variance", "HueVariance");

	sliderDialog(getElementById("sparkBrightnessVariance"),
		"Brightness Variance", "BrightnessVariance");

	sliderDialog(getElementById("sparkThickness"),
		"Spark Thickness", "Thickness");

	sliderDialog(getElementById("sparkDensity"),
		"Spark Density", "Density");

	sliderDialog(getElementById("sparkDuration"),
		"Spark Duration", "Duration");

	var exportOptions =
		getElementById("exportOptions");
	exportOptions.addEventListener("click",
		function(e) {
			var options = shockTherapyConfig.exportConfig();

			/*
			* This is handled in our android app by overriding
			* WebViewClient.shouldOverrideUrlLoading to parse
			* the data url and pass it to a file-save intent
			*/
			saveUrl("data:,"+ encodeURI(JSON.stringify(options, null, "\t")),
				"ShockTherapyOptions.json");
		});

	var importOptionsButton =
		getElementById("importOptionsButton");
	importOptionsButton.addEventListener("click",
		function(e) {
			if (/ android:com\.googlecode\.electroshocktherapy$/.exec(
				global.window.navigator.userAgent) !== null)
			{
				/*
				* NOTE: The FileReader object is not available in
				* Android 2.3. FileReader works in the stock
				* Android 4.0 browser, but the onload event doesn't
				* seem to fire when using our
				* WebChromeClient.openFileChooser override for
				* the WebView in our android app.
				*/
				var encoding = global.window.document.contentEncoding || "utf-8";
				global.androidGetTextFileCb = function(content) {
					delete global.androidGetTextFileCb;
					shockTherapyConfig.importConfig(JSON.parse(content));
					global.window.location.reload();
				}
				Android.getTextFile(
					"application/json", encoding, "Import Options");
			}
			else
			{
				openFileDialog(function(e) {
						var reader = new FileReader();
						reader.onload = function(e) {
								shockTherapyConfig.importConfig(
									JSON.parse(e.target.result));
								global.window.location.reload();
							};
						reader.onerror = function(e) {
								throw e;
							};
						var encoding = global.window.document.contentEncoding || "utf-8";
						reader.readAsText(e.target.files[0], encoding);
					});
			}
		});

	var resetOptionsButton =
		getElementById("resetOptionsButton");
	resetOptionsButton.addEventListener("click",
		function(e) {
			var content = createElement("div");
			var dialog = new ModalDialog(content,
				{title: "Load Defaults"});
			dialog.addEventListener("click",
				function(e) {
					if (!dialog.cancelled)
					{
						shockTherapyConfig.clear();
						global.window.location.reload();
					}
				}
			)
			dialog.show();
		});
	});
	var curtain = getElementById("curtain");
	curtain.style.visiblity = "hidden";
	global.window.document.body.style.visibility = "visible";
	global.window.document.body.removeChild(curtain);
});
