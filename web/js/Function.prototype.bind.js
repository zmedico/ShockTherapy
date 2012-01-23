/* Implement bind for browsers that don't support it.
 * source: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * Tested with:
 * 
 *    Safari 5.1.2
 */
if (!Function.prototype.bind)
(function(global) {
	Function.prototype.bind = function (oThis) {  
		if (typeof this !== "function") {  
			// closest thing possible to the ECMAScript 5 internal IsCallable function  
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
			return fToBind.apply(this instanceof fNOP 
									? this
									: oThis || global,  
								aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		if (this.prototype)
			fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}(this));
