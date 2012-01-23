/* Ported from Python's colorsys module, with only syntax
 * changes to make it work in JavaScript. Also, note that the
 * modulus operator (%) in Python produces an absolute value,
 * while in JavaScript is preserves sign.
 */
this.colorsys = (function() {

	var colorsys = {};

	var ONE_THIRD = 1.0/3.0;
	var ONE_SIXTH = 1.0/6.0;
	var TWO_THIRD = 2.0/3.0;

	var max = function() {
		var i , maxval = arguments[0];
		for (i = 1; i < arguments.length; i++)
			if (arguments[i] > maxval)
				maxval = arguments[i];
		return maxval;
	}

	var min = function() {
		var i , minval = arguments[0];
		for (i = 1; i < arguments.length; i++)
			if (arguments[i] < minval)
				minval = arguments[i];
		return minval;
	}

	colorsys.rgb_to_hls = function(r, g, b) {
		var bc, gc, h, l, maxc, minc, rc, s;
		maxc = max(r, g, b);
		minc = min(r, g, b);
		// XXX Can optimize (maxc+minc) and (maxc-minc)
		l = (minc+maxc)/2.0;
		if (minc == maxc)
			return {h:0.0, l:l, s:0.0};
		if (l <= 0.5)
			s = (maxc-minc) / (maxc+minc);
		else
			s = (maxc-minc) / (2.0-maxc-minc);
		rc = (maxc-r) / (maxc-minc);
		gc = (maxc-g) / (maxc-minc);
		bc = (maxc-b) / (maxc-minc);
		if (r == maxc)
			h = bc-gc;
		else if (g == maxc)
			h = 2.0+rc-bc;
		else
			h = 4.0+gc-rc;
		h = (h/6.0) % 1.0;
		if (h < 0.0)
			h += 1.0;
		return {h: h, l: l, s:s};
	}

	colorsys.hls_to_rgb = function(h, l, s) {
		var m1, m2;
		if (s == 0.0)
			return {r: l, g: l, b: l};
		if (l <= 0.5)
			m2 = l * (1.0+s);
		else
			m2 = l+s-(l*s);
		m1 = 2.0*l - m2;
		return {r: _v(m1, m2, h+ONE_THIRD), g: _v(m1, m2, h), b: _v(m1, m2, h-ONE_THIRD)};
	}

	var _v = function(m1, m2, hue) {
		hue = hue % 1.0;
		if (hue < 0.0)
			hue += 1.0;
		if (hue < ONE_SIXTH)
			return m1 + (m2-m1)*hue*6.0;
		if (hue < 0.5)
			return m2;
		if (hue < TWO_THIRD)
			return m1 + (m2-m1)*(TWO_THIRD-hue)*6.0;
		return m1;
	}

	return colorsys;

}());
