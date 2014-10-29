chrome.app.runtime.onLaunched.addListener(function() {
	window.open('layout/main.html',
		"ShockTherapy-" + Math.random().toString(36).slice(2));
});
