// Javascript Inheritance Done Right, by Juan Mendes
// http://js-bits.blogspot.com/2010/08/javascript-inheritance-done-right.html
function extend(base, sub) {
    var surrogateCtor = function() {};
	surrogateCtor.prototype = base.prototype;
	sub.prototype = new surrogateCtor();
	sub.prototype.constructor = sub;
	// Add a reference to the parent's prototype
	sub.base = base.prototype;
	// so we can define the constructor inline
	return sub;
}
