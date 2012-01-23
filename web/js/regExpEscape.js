// http://simonwillison.net/2006/Jan/20/escape/#p-6
function regExpEscape(s) {
	return s.replace(regExpEscape.pattern, "\\$&");
}

regExpEscape.pattern = /[-[\]{}()*+?.,\\^$|#\s]/g;
