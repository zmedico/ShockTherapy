
define(function(){

	var win = window;

	this.cancelAnimFrame =
		win.cancelAnimationFrame ||
		win.webkitCancelAnimationFrame ||
		win.mozCancelAnimationFrame ||
		win.oCancelAnimationFrame ||
		win.msCancelAnimationFrame ||
		function(timeoutId){
			win.clearTimeout(timeoutId);
		};

	// requestAnim shim layer by Paul Irish
	return  win.requestAnimationFrame       ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame    ||
			win.oRequestAnimationFrame      ||
			win.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				return win.setTimeout(callback, 1000 / 60);
			};
});
