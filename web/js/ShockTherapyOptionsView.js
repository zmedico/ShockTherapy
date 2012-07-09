
require([
	"CheckboxWidget",
	"ColorChooser",
	"ModalDialog",
	"openFileDialog",
	"saveUrl",
	"RadioGroupWidget",
	"ShockTherapy",
	"ShockTherapyActionBar",
	"ShockTherapyDefaults",
	"simulateClick",
	"SliderWidget",
], function() {

this.ShockTherapyOptionsView = (function(global) {

	var constructor = function(uri, actionBar,
		config, resourceFactory, resources, reloadTheme) {
		this._uri = uri;
		this._actionBar = actionBar;
		this._config = config;
		this._resourceFactory = resourceFactory;
		this._resources = resources;
		this._reloadTheme = reloadTheme;
		this._container = null;
		this._callback = null;
		this._content = null;
		this._req = null;
		this._popups = {};
	}

	constructor.prototype._configureActionBar = function() {
		this._actionBar.setTitle("Options");
		this._actionBar.setUpButtonUri("main.html");
		this._actionBar.setActions(["Main", "Screen Saver", "About"]);
		this._actionBar.show();
	}

	constructor.prototype.display = function(container, callback) {
		this._configureActionBar();
		if (this._content === null) {
			this._container = container;
			this._callback = callback;
			this._initContent();
		}
		else {
			container.appendChild(this._content);
			if (callback)
				callback.apply(global);
		}
	}

	constructor.prototype.undisplay = function() {
		this._actionBar.hide();
		var popup, popupKeys = Object.keys(this._popups);
		for (var i = 0; i < popupKeys.length; i++) {
			popup = this._popups[popupKeys[i]];
			delete this._popups[popupKeys[i]];
			popup.hide();
		}
	}

	constructor.prototype._initContent = function() {
		this._req = new XMLHttpRequest();
		this._req.onreadystatechange = this._loadCallback.bind(this);
		this._req.open("GET", this._uri);
		this._req.send(null);
	}

	constructor.prototype._loadCallback = function(e) {
		if (this._req.readyState === 4) {
			if (this._req.status !== 200)
				throw this._req.statusText;
			var div = this._container.ownerDocument.createElement("div");
			div.innerHTML = this._req.responseText;
			this._req = null;
			this._content = div.firstChild;
			div.removeChild(div.firstChild);
			this._container.appendChild(this._content);
			this._container = null;
			this._connectListeners();
			if (this._callback) {
				this._callback.apply(global);
				this._callback = null;
			}
		}
	}

	constructor.prototype._connectListeners = function() {
		var createElement, doc, getElementById, popupCounter, popups,
			resourceFactory, resources, shockTherapyConfig;
		doc = this._content.ownerDocument;
		createElement = doc.createElement.bind(doc);
		getElementById = doc.getElementById.bind(doc);

		shockTherapyConfig = this._config;
		resourceFactory = this._resourceFactory;
		resources = this._resources;
		popups = this._popups;
		popupCounter = 0;

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
			button.onclick =
				function(e) {
					var popupId = popupCounter++;
					popups[popupId] = dialog;
					dialog.addEventListener("click",
						function(e) {
							delete popups[popupId];
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
					return false;
				};
		}

		function checkboxButton(button, checkboxCanvas, key)
		{
			var checkbox = new CheckboxWidget(checkboxCanvas, resources);
			checkbox.setEnabled(false); // parent button handles clicks
			checkbox.checked =
				shockTherapyConfig.getBoolean(key, ShockTherapyDefaults[key]);
			button.onclick =
				function(e) {
					checkbox.checked = !checkbox.checked;
					shockTherapyConfig.setBoolean(key,
						checkbox.checked);
					return false;
				};
		}

		var themeButton = getElementById("themeButton");
		var reloadTheme = this._reloadTheme;

		themeButton.onclick =
			function(e) {
				var radioGroup, choices, container, dialog, i, keys, themes;
				themes = resourceFactory.listThemes();
				container = createElement("div");
				choices = [];
				keys = Object.keys(themes);
				for (i = 0; i < keys.length; i++)
					choices.push(themes[keys[i]].name);

				radioGroup =
					new RadioGroupWidget(container, resources, choices);

				dialog = new ModalDialog(container, {title: "Theme"});
				var popupId = popupCounter++;
				popups[popupId] = dialog;
				dialog.addEventListener("click",
					function(e) {
						delete popups[popupId];
						if (!dialog.cancelled &&
							radioGroup.selection != null &&
							keys[radioGroup.selection] !=
							resources.getProfileKey())
						{
							shockTherapyConfig.setString(
								"Theme", keys[radioGroup.selection]);
							reloadTheme();
						}
					}
				)

				dialog.show();
				for (i = 0; i < keys.length; i++)
					if (keys[i] == resources.getProfileKey()) {
						radioGroup.selection = i;
						break;
					}

				return false;
			};

		checkboxButton(getElementById("enableMenuButton"),
			getElementById("menuButtonCheckbox"), "MenuButton");

		checkboxButton(getElementById("soundButton"),
			getElementById("soundCheckbox"), "Sound");

		sliderDialog(getElementById("soundVolume"),
			"Sound Volume", "SoundVolume");

		checkboxButton(getElementById("vibratorButton"),
			getElementById("vibratorCheckbox"), "Vibrator");

		sliderDialog(getElementById("vibratorIntensity"),
			"Vibrator Intensity", "VibratorIntensity");

		var sparkColor = getElementById("sparkColor");

		sparkColor.onclick =
			function(e) {
				var content = createElement("div");
				content.setAttribute("class", "dialogWidth");
				var colorChooser = new ColorChooser(content, resources);
				var dialog = new ModalDialog(content, {title: "Spark Color"});
				var popupId = popupCounter++;
				popups[popupId] = dialog;
				dialog.addEventListener("click",
					function(e) {
						delete popups[popupId];
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
				return false;
			};

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
		exportOptions.onclick =
			function(e) {
				var options = shockTherapyConfig.exportConfig();

				if (ShockTherapy.sugar)
				{
					var req = new ShockTherapySugarRequest();
					req.open("GET", "/ShockTherapyConfig.export:" +
						JSON.stringify(options, null, "\t"));
					req.send(null);
					return false;
				}

				var URL = window.webkitURL || window.URL;
				var Blob = window.Blob;
				var BlobBuilder = window.BlobBuilder ||
					window.WebKitBlobBuilder ||
					window.MozBlobBuilder ||
					window.MSBlobBuilder;

				if (!ShockTherapy.android && (Blob || BlobBuilder) && URL) {
					/* The saveUrl() / data URI approach stopped working in
					Chrome 19, so use BlobBuilder and createObjectURL instead.
					*/
					var options_str = JSON.stringify(options, null, "\t");
					var blob = null;
					if (Blob)
						blob = new Blob([options_str], {type: "text/plain"});
					else {
						var bb = new BlobBuilder();
						bb.append(options_str);
						blob = bb.getBlob("text/plain");
					}

					var a = createElement("a");
					a.download = "ShockTherapyOptions.json";
					a.href = URL.createObjectURL(blob);
					simulateClick(a);
					setTimeout(
						function() { URL.revokeObjectURL(a.href); },
						1500);
					return false;
				}

				/*
				* This is handled in our android app by overriding
				* WebViewClient.shouldOverrideUrlLoading to parse
				* the data url and pass it to a file-save intent
				*/
				saveUrl("data:,"+ encodeURI(
					JSON.stringify(options, null, "\t")),
					"ShockTherapyOptions.json");

				return false;
			};

		var importOptionsButton =
			getElementById("importOptionsButton");
		importOptionsButton.onclick =
			function(e) {
				if (ShockTherapy.android)
				{
					/*
					* NOTE: The FileReader object is not available in
					* Android 2.3. FileReader works in the stock
					* Android 4.0 browser, but the onload event doesn't
					* seem to fire when using our
					* WebChromeClient.openFileChooser override for
					* the WebView in our android app.
					*/
					var encoding = doc.contentEncoding || "utf-8";
					global.androidGetTextFileCb = function(content) {
						delete global.androidGetTextFileCb;
						shockTherapyConfig.importConfig(JSON.parse(content));
						reloadTheme();
					}
					ShockTherapy.android.getTextFile(
						"application/json", encoding, "Import Options");
				}
				else if (ShockTherapy.sugar)
				{
					var req = new ShockTherapySugarRequest();
					req.open("GET", "/ShockTherapyConfig.import");
					req.send(null);
				}
				else
				{
					openFileDialog(function(e) {
							var reader = new FileReader();
							reader.onload = function(e) {
									shockTherapyConfig.importConfig(
										JSON.parse(e.target.result));
									reloadTheme();
								};
							reader.onerror = function(e) {
									throw e;
								};
							var encoding = doc.contentEncoding || "utf-8";
							reader.readAsText(e.target.files[0], encoding);
						});
				}
				return false;
			};

		var resetOptionsButton =
			getElementById("resetOptionsButton");
		resetOptionsButton.onclick =
			function(e) {
				var content = createElement("div");
				var dialog = new ModalDialog(content,
					{title: "Load Defaults"});
				var popupId = popupCounter++;
				popups[popupId] = dialog;
				dialog.addEventListener("click",
					function(e) {
						delete popups[popupId];
						if (!dialog.cancelled)
						{
							shockTherapyConfig.clear();
							reloadTheme();
						}
					}
				)
				dialog.show();
				return false;
			};

	}

	return constructor;

})(this);

});

