// requestAnim shim layer by Paul Irish
this.requestAnimFrame = (function(global){
	var win = global.window;
	return  win.requestAnimationFrame       ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame    ||
			win.oRequestAnimationFrame      ||
			win.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				win.setTimeout(callback, 1000 / 60);
			};
})(this);
