
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"ContextMenu",
		"ShockTherapyActionBar",
		"ShockTherapyWidget"
	], function() {

	var getElementById, global;
	global = this;
	getElementById = global.window.document.getElementById.bind(
		global.window.document);

	var actionBar = new ShockTherapyActionBar();
	actionBar.setTitle("Shock Therapy");
	actionBar.setUpButtonUri(null);
	actionBar.setActions(["Options", "About"]);
	actionBar.hide();

	var c = getElementById("mainCanvas");
	c.width = global.window.innerWidth;
	c.height = global.window.innerHeight;
	var widget = new ShockTherapyWidget("..", shockTherapyConfig, c);
	var t = null;
	window.addEventListener("resize", function()
		{
			if (t === null)
			{
				t = global.window.setTimeout(function()
					{
						c.width = global.window.innerWidth;
						c.height = global.window.innerHeight;
						t = null;
					},
					250);
			}

		},
		false);

	var contextMenu = null;

	widget.canvas.addEventListener("contextmenu", function(e) {
		if (widget.running)
			return;
		if (contextMenu === null) {
			var button, hr;
			contextMenu = new ContextMenu(
				global.window.document.createElement("div"), widget.canvas);

			button = global.window.document.createElement("button");
			button.setAttribute("class", "contextMenuButton");
			button.appendChild(button.ownerDocument.createTextNode("Options"));
			button.addEventListener("click",
				function(e) {
					global.window.location.assign("options.html");
				});
			contextMenu.container.appendChild(button);

			hr = global.window.document.createElement("hr");
			hr.setAttribute("class", "listViewBorder");
			contextMenu.container.appendChild(hr);

			button = global.window.document.createElement("button");
			button.setAttribute("class", "contextMenuButton");
			button.appendChild(button.ownerDocument.createTextNode("About"));
			button.addEventListener("click",
				function(e) {
					global.window.location.assign("about.html");
				});
			contextMenu.container.appendChild(button);

			global.window.document.body.appendChild(contextMenu.container);
			widget.addEventListener("click", function(e) {
				contextMenu.onblur();
			});
		}
		contextMenu.onContextMenu(e);
	});

	ShockTherapy.viewChanged(global.window.location.href);

	});
});
