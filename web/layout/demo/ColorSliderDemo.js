
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {
		require([
			"ColorSlider"
		], function() {
			var testSlider = new ColorSlider(
				document.getElementById("testSlider"), resources);
			testSlider.repaint();
		});
});
