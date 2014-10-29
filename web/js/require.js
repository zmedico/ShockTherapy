// Similar to RequireJS.
this.require = (function(global) {
	var loadedModules = {};
	var require = function(names, callback) {
		//console.log("require names = " + JSON.stringify(names));
		var args, callbackID, head, i, info, keys, name, element, refs;

		head = global.window.document.head;
		refs = {};
		keys = [];
		var match, modulePath, moduleName;
		for (i = 0; i < names.length; i++) {
			name = names[i];
			match = require._srcPattern.exec(name);
			if (match === null)
				throw "invalid require input: " + name;
			modulePath = match[1];
			moduleName = match[2];
			if (!loadedModules.hasOwnProperty(moduleName)) {
				refs[moduleName] = modulePath;
				keys.push(moduleName);
			}
		}
		if (keys.length === 0) {
			args = [];
			for (i = 0; i < names.length; i++)
				args.push(loadedModules[names[i]]);
			//console.log("require callback names: " + JSON.stringify(names));
			callback.apply(global, args);
		}
		else {
			callbackID = require.callbackID++;
			info = {
				callback: callback,
				refs: refs,
				names: names
			};
			for (i = 0; i < keys.length; i++) {
				name = keys[i];
				if (require.pendingElements.hasOwnProperty(name)) {
					require.pendingElements[name][callbackID] = info;
					continue;
				}
				element = document.createElement("script");
				element.setAttribute("type", "text/javascript");
				element.setAttribute("async", "true");
				modulePath = refs[name];
				var src;
				if (modulePath)
					src = modulePath + name;
				else
					src = name;
				if (require.path.length > 0)
					element.src = require.path + "/" + src + ".js";
				else
					element.src = src + ".js";
				head.appendChild(element);
				if (loadedModules.hasOwnProperty(name)) {
					//Handle synchronous load, though it may never happen?
					delete refs[name];
				} else {
					require.pendingElements[name] = {};
					require.pendingElements[name][callbackID] = info;
					require.remainingCallbacks += 1;
					element.onload = require.listener.bind(global, element);
				}
			}
			if (Object.keys(refs).length === 0) {
				// All elements loaded synchronously.
				args = [];
				for (i = 0; i < names.length; i++)
					args.push(loadedModules[names[i]]);
				//console.log("require callback names: " + JSON.stringify(names));
				callback.apply(global, args);
			}
		}
	};

	// base path for scripts
	require.path = null;
	require._srcModRegex = /.*\/(.*)\.[^.]*/;
	require._srcPattern = /^(.*\/)?([^\/]*)$/;
	require.callbackID = 0;
	require.remainingCallbacks = 0;
	require.loadedModules = loadedModules;
	require.pendingElements = {};
	require.pollNames = {};
	require.previousKeysHash = null;
	require.timeout = 0;
	require.timeoutInitial = 0;
	require.timeoutMax = -1;
	require.listener = function(element) {
		var callingModule = require._srcModRegex.exec(element.src)[1];
		//console.log("onload: " + element.src + " callingModule: " + callingModule);
		require.remainingCallbacks -= 1;
		var args, callbackIDs, callbacks, i, info, j,
			name, pollNames, remove, src;
		if (element !== null) {
			src = element.src;
			element.onload = null;
			name = src.substring(src.lastIndexOf("/") + 1, src.lastIndexOf("."));
			require.pollNames[name] = true;
		}

		if (!require.loadedModules.hasOwnProperty(callingModule) &&
			window.hasOwnProperty(callingModule)) {
			require.loadedModules[callingModule] = window[callingModule];
		}

		/* Execute as many callbacks as possible in a loop, since
		 * each call can satisfy dependencies for the next loop.
		 */
		do {
			remove = [];
			pollNames = Object.keys(require.pollNames);
			for (i = 0; i < pollNames.length; i++)
				if (loadedModules.hasOwnProperty(pollNames[i])) {
					name = pollNames[i];
					delete require.pollNames[name];
					callbacks = require.pendingElements[name];
					delete require.pendingElements[name];
					callbackIDs = Object.keys(callbacks);
					for (j = 0; j < callbackIDs.length; j++) {
						info = callbacks[callbackIDs[j]];
						delete info.refs[name];
						if (Object.keys(info.refs).length === 0)
							remove.push(info);
					}
				}

			for (i = 0; i < remove.length; i++) {
				args = [];
				for (j = 0; j < remove[i].names.length; j++)
					args.push(loadedModules[remove[i].names[j]]);
				//console.log("require callback names: " + JSON.stringify(remove[i].names));
				remove[i].callback.apply(global, args);
			}
		}
		while (remove.length > 0);

		if (require.remainingCallbacks === 0) {
			/* This timeout section should only be needed if there
			 * are registered callbacks that complete asynchronously,
			 * or if require() has been called with broken scripts
			 * and/or incorrect independency specifications.
			 * Timeouts grow exponentially from timeoutInitial to
			 * timeoutMax, by powers of 2:  0ms, 2ms, 4ms, 8ms, 16ms...
			 */
			var keys = Object.keys(require.pollNames);
			if (keys.length > 0) {
				keys.sort();
				var keysHash = keys.join(" ");
				if (require.timeoutMax < 0)
					throw "require timeout: " + keysHash;
				if (require.previousKeysHash === null ||
					require.previousKeysHash != keysHash) {
					require.timeout = require.timeoutInitial;
				} else {
					if (require.timeout === 0)
						require.timeout = 1;
					else if (require.timeout >= require.timeoutMax)
						throw "require timeout: " + keysHash;
					require.timeout *= 2;
				}

				global.window.setTimeout(function() {
					throw "require retry: " + keysHash;
				}, 0);

				require.previousKeysHash = keysHash;
				require.remainingCallbacks += 1;
				global.window.setTimeout(function(evt) {
					require.listener(null);
				}, require.timeout);
			}
		}
	};

	return require;
}(this));

this.define = (function(global) {

	var define = function(names, callback) {
		if (!(names instanceof Array)) {
			callback = names;
			names = [];
		}
		var callingModule = require._srcModRegex.exec(document.currentScript.src)[1];
		//console.log('define callingModule: ' + callingModule + 'names: ' + JSON.stringify(names));
		require(names, function() {
			//console.log('define require callback: ' + JSON.stringify(names));
			require.loadedModules[callingModule] = callback.apply(global, arguments);
			window[callingModule] = require.loadedModules[callingModule];
		});
	};
	return define;
})(this);

(function() {
	var scripts = document.getElementsByTagName("script");
	var srcPattern = /(^|^.*\/)require.js$/;
	var match, path;
	for (var i = scripts.length - 1; i >= 0; i--) {
		match = srcPattern.exec(scripts[i].src);
		if (match !== null) {
			path = match[1];
			if (path.length > 0)
			// strip trailing slash
				path = path.substr(0, path.length - 1);
			require.path = path;
			var dataMain =
				scripts[i].getAttribute("data-main");
			if (dataMain !== null) {
				var dataMainElement = document.createElement("script");
				dataMainElement.setAttribute("type", "text/javascript");
				dataMainElement.setAttribute("async", "true");
				dataMainElement.setAttribute("src", dataMain + ".js");
				document.head.appendChild(dataMainElement);
			}
			return;
		}
	}
	throw "failed to locate require.js script tag";
})();
