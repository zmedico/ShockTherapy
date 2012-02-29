
loadTheme("..", function (shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"ContextMenu",
		"ShockTherapy",
		"ShockTherapyActionBar",
		"ShockTherapyMainView"
	], function() {

	var getElementById, global;
	global = this;
	getElementById = global.window.document.getElementById.bind(
		global.window.document);

	var curtain = getElementById("curtain");
	var actionBar = new ShockTherapyActionBar();
	var contentDiv = getElementById("content");
	var mainView = new ShockTherapyMainView(shockTherapyConfig);

	while (contentDiv.firstChild)
		contentDiv.removeChild(contentDiv.firstChild);

	mainView.display(contentDiv, function() {
			mainView.configureActionBar(actionBar);
			curtain.style.zIndex = -1;
			global.window.document.body.style.zIndex = 0;
			ShockTherapy.viewChanged(global.window.location.href);
		}
	);

	});
});
