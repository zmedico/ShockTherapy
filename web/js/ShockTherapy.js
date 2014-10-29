
define(function() {

	var global = this;

	var module = {

		android : null,

		focused : true,

		goBack : function() {
			global.window.history.back();
		},

		mobile: (navigator.userAgent + navigator.appVersion).toLowerCase().indexOf("mobile") > -1,

		touch: !!(window.Touch || "ontouchstart" in window || "createTouch" in document),

		viewChanged : function(uri) {
			if (ShockTherapy.android) {
				ShockTherapy.android.viewChanged(uri);
			}
			else if (ShockTherapy.sugar) {
				require(["ShockTherapySugarRequest"], function(ShockTherapySugarRequest) {
					var req = new ShockTherapySugarRequest();
					req.open("GET", "/ShockTherapy.viewChanged:" + uri);
					req.send(null);
				});
			}
		},

		sugar: false
	}

	if (/ android:com\.googlecode\.electroshocktherapy$/.exec(
		global.window.navigator.userAgent) !== null)
		module.android = Android;
	else if (/ sugar:com\.googlecode\.electroshocktherapy$/.exec(
		global.window.navigator.userAgent) !== null)
		module.sugar = true;

	return module;

});
