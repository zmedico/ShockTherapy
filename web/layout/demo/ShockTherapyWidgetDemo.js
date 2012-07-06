
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {

	require(["ShockTherapyWidget"], function() {
		new ShockTherapyWidget("../..", shockTherapyConfig,
			window.document.getElementById("mainCanvas"));
		});

});
