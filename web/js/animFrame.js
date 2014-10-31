
define("animFrame", function(){

	var win = window;

	var module = {};

	module.cancel = (
		win.cancelAnimationFrame ||
		win.webkitCancelAnimationFrame ||
		win.mozCancelAnimationFrame ||
		win.oCancelAnimationFrame ||
		win.msCancelAnimationFrame ||
		function(timeoutId){
			win.clearTimeout(timeoutId);
		}).bind(win);

	// requestAnim shim layer by Paul Irish
	module.request = (
			win.requestAnimationFrame       ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame    ||
			win.oRequestAnimationFrame      ||
			win.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				return win.setTimeout(callback, 1000 / 60);
			}).bind(win);

	return module;
});
