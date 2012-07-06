
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {
		require([
			"ColorChooser"
		], function() {
			new ColorChooser(document.getElementById("container"),
				resources).show();
		});
});
