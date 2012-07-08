
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {

	require(["ShockTherapyWidget"], function() {
		var widget = new ShockTherapyWidget("../..", shockTherapyConfig,
			window.document.getElementById("mainCanvas"));
		widget.interactive = true;
	});

});
