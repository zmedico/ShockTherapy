
(function(global) {
	var names = ["navigator"];
	var objects = {};
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		var object = global[name]
		objects[name] = {};
		for (var k in object) {
			try {
				if (typeof object[k] === "string")
					objects[name][k] = object[k];
			}
			catch (e) {
				window.setTimeout(function() {
						throw e;
					}, 0);
			}
		}
	}
	var html = [];
	html.push("<p>Client Info:</p>\n")
	html.push("<p><pre>\n");
	html.push(JSON.stringify(objects, null, "\t"));
	html.push("</pre></p>\n");
	html.push("<p>\n");
	if ((navigator.userAgent + navigator.appVersion).toLowerCase().indexOf("mobile") > -1)
		html.push("Mobile: yes\n");
	else
		html.push("Mobile: no\n");
	html.push("</p>\n");
	html.push("<p>\n");
	if (window.Touch || "ontouchstart" in window || "createTouch" in document)
		html.push("Touch: yes\n");
	else
		html.push("Touch: no\n");
	html.push("</p>\n");
	var div = document.createElement("div");
	div.innerHTML = html.join("");
	document.body.appendChild(div);

}(this));
