
require([
	"regExpEscape",
	"require",
], function() {

this.Theme = (function(global) {

	var constructor = function(profiles, profileKey, uri) {
		this._profiles = profiles;
		this._profileKey = profileKey;
		this.uri = uri;
		this._objectValue = null;
		this._strings = null;
		this._css = null
		this._css_text = null;
		this._pending_reqs = 0;
		this._req = null;
		this._callback = null;
		this._css_nodes = []
	}

	constructor._parseValue = /^([^:]+):(.*)$/;
	constructor._parseValue = constructor._parseValue.exec.bind(constructor._parseValue)

	constructor.prototype.getProfileKey = function() {
		return this._profileKey;
	}

	constructor.prototype.addCssToDoc = function() {
		var doc, node, text;
		var text = this.getCss();
		if (text !== null) {
			doc = global.window.document;
			if (doc.createStyleSheet) {
				// Microsoft Internet Explorer
				node = doc.createStyleSheet()
				node.cssText = text;
				this._css_nodes.push(node.owningElement);
			}
			else {
				node = doc.createElement("style");
				node.type = "text/css";
				node.appendChild(doc.createTextNode(text));
				doc.head.appendChild(node);
				this._css_nodes.push(node);
			}
		}
	}

	constructor.prototype.removeCssFromDoc = function() {
		var doc, node;
		doc = global.window.document;
		while (this._css_nodes.length > 0) {
			node = this._css_nodes.pop();
			node.parentNode.removeChild(node)
		}
	}

	constructor.prototype.getCss = function() {
		var value = null;
		if (this._css_text !== null) {
			value = "";
			var i, keys, s, pattern, replacer;
			keys = Object.keys(this._strings);
			pattern = [];
			for (i = 0; i < keys.length; i++) {
				pattern.push(regExpEscape(keys[i]));
			}
			pattern = new RegExp("(^|[\\W.])(" + pattern.join("|") + ")([\\W.]|$)", "g")
			replacer = function(str, p1, p2, p3, offset, s) {
				return p1 + this[p2] + p3;
			}
			replacer = replacer.bind(this._strings);
			for (i = 0; i < this._css_text.length; i++) {
				s = this._css_text[i];
				s = s.replace(pattern, replacer);
				value += " " + s;
			}
		}
		return value;
	}

	constructor.prototype.getString = function(key) {
		var value = null;
		if (this._strings.hasOwnProperty(key))
			value = this._strings[key];
		return value;
	}

	constructor.prototype.createObject = function(key) {
		var instance = null;
		if (this._objectValue.hasOwnProperty(key))
			instance = new global[this._objectValue[key]](this);
		return instance;
	}

	constructor.prototype._parseStrings = function(data) {

		if (this._objectValue === null)
			this._objectValue = {};
		if (this._strings === null)
			this._strings = {};

		var c, i, key, keys, match, parse, type, value;
		keys = Object.keys(data);
		parse = constructor._parseValue;
		refs = {};
		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			value = data[key];
			match = parse(value); 
			if (match === null)
				throw "invalid value for key '" + key + "': " + value
			type = match[1];
			if (type == "str")
				this._strings[key] = match[2];
			else if (type == "js")
				this._objectValue[key] = match[2];
			else if (type == "ref")
				refs[key] = match[2];
			else
				throw "invalid value for key '" + key + "': " + value
		}

		c = null;
		while (true) {
			keys = Object.keys(refs);
			if (keys.length == 0)
				break
			else if (c != null && c == keys.length) {
				value = [];
				for (i = 0; i < keys.length; i++) {
					value.push(refs[keys[i]]);
				}
				throw "unresolvable refs: " + value;
			}
			else
				c = keys.length;
			for (i = 0; i < keys.length; i++) {
				key = keys[i];
				value = refs[key];
				if (refs.hasOwnProperty(value))
					/* Wait for this ref to get resolved, to ensure
					* that overrides of parent profile settings are
					* properly accounted for.
					*/
					continue
				if (this._strings.hasOwnProperty(value)) {
					this._strings[key] = this._strings[value];
					delete refs[key];
				}
				else if (this._objectValue.hasOwnProperty(value)) {
					this._objectValue[key] = this._objectValue[value];
					delete refs[key];
				}
			}
		}
	}

	constructor.prototype._addProfileNode = function(node) {
		if (node.hasOwnProperty("resources"))
			this._parseStrings(node.resources);
		if (node.hasOwnProperty("css")) {
			if (this._css === null)
				this._css = [];
			for (var i = 0; i < node.css.length; i++)
				this._css.push(node.css[i]);
		}
	}

	constructor.prototype.load = function(callback) {
		this._callback = callback;
		this._req = new XMLHttpRequest();
		this._req.onreadystatechange = this._loadCallback1.bind(this);
		this._req.open("GET", this.uri + "/data/strings.json");
		this._req.send(null);
	}

	constructor.prototype._loadCallback1 = function(e) {
		if (this._req.readyState === 4) {
			if (this._req.status !== 200)
				throw this._req.statusText;

			this._parseStrings(JSON.parse(this._req.responseText));
			this._req = null;
			this._parseProfile();
		}
	}

	constructor.prototype._parseProfile = function() {
		var i, node, stack;
		node = this._profiles[this._profileKey];
		stack = [];
		while (node != null) {
			stack.push(node);
			if (node.hasOwnProperty("parent")) {
				if (!this._profiles.hasOwnProperty(node["parent"]))
					throw "unresolvable parent: " + node["parent"]
				node = this._profiles[node["parent"]];
			}
			else
				node = null;
		}
		stack.reverse();
		for (i = 0; i < stack.length; i++) {
			node = stack[i];
			this._addProfileNode(node);
		}
		this._loadScripts();
	}

	constructor.prototype._loadScripts = function() {
		var values = [];
		var keys = Object.keys(this._objectValue);
		for (var i = 0; i < keys.length; i++) {
			values.push(this._objectValue[keys[i]]);
		}
		require(values, this._loadCss.bind(this));
	}

	constructor.prototype._loadCss = function() {
		if (this._css === null) {
			this._loadComplete();
			return
		}

		this._req = [];
		this._css_text = [];
		this._pending_reqs = this._css.length;
		for (var i = 0; i < this._css.length; i++) {
			this._req.push(new XMLHttpRequest());
			this._req[i].onreadystatechange = this._loadCssCb.bind(this, i);
			this._req[i].open("GET", this.uri + "/css/" + this._css[i] + ".css");
			this._req[i].send(null);
		}
	}

	constructor.prototype._loadCssCb = function(i, e) {
		if (this._req[i].readyState === 4) {
			this._pending_reqs--;
			if (this._req[i].status !== 200)
				throw this._req[i].statusText;
			this._css_text[i] = this._req[i].responseText;
			if (this._pending_reqs == 0) {
				this._req = null;
				this._loadComplete();
			}
		}
	}

	constructor.prototype._loadComplete = function() {
		this._callback();
		this._callback = null;
	}

	return constructor;

}(this));

});
