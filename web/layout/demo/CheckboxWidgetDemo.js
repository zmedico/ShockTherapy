
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {

	require([
		"CheckboxWidget"
	], function() {
		var testCheckbox = new CheckboxWidget(
			document.getElementById("testCheckbox"), resources);
		testCheckbox.setEnabled(false);
		testCheckbox.click();
		document.getElementById("testButton").addEventListener(
			"click", function(e) {
				testCheckbox.checked = !testCheckbox.checked;
		});

	});

});
