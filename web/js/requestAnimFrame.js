// requestAnim shim layer by Paul Irish
define(function(){
	var win = window;
	return  win.requestAnimationFrame       ||
			win.webkitRequestAnimationFrame ||
			win.mozRequestAnimationFrame    ||
			win.oRequestAnimationFrame      ||
			win.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				win.setTimeout(callback, 1000 / 60);
			};
});
