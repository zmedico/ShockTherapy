
// Similar to RequireJS. Set require.path to the base path for scripts,
// and then call require([name1, name2,...], callback).
this.require = (function(global) {
	var require = function(names, callback) {
		var callbackID, head, i, info, keys, name, element, refs;

		if (require.path === null) {
			// use the src attribute of the require.js script tag
			(function() {
				var scripts = global.document.getElementsByTagName("script");
				var srcPattern = /(^|^.*\/)require.js$/;
				var match, path;
				for (var i = scripts.length - 1; i >= 0 ; i--) {
					match = srcPattern.exec(scripts[i].src);
					if (match !== null) {
						path = match[1];
						if (path.length > 0)
							// strip trailing slash
							path = path.substr(0, path.length - 1);
						require.path = path;
						return
					}
				}
				throw "failed to locate require.js script tag"
			})();
		}

		head = global.window.document.head;
		refs = {};
		keys = [];
		var match, modulePath, moduleName;
		for (i = 0; i < names.length; i++) {
			name = names[i];
			match = require._srcPattern.exec(name);
			if (match === null)
				throw "invalid require input: " + name
			modulePath = match[1];
			moduleName = match[2];
			if (!global.hasOwnProperty(moduleName)) {
				refs[moduleName] = modulePath;
				keys.push(moduleName);
			}
		}
		if (keys.length == 0)
			callback.apply(global);
		else {
			callbackID = require.callbackID++;
			info = {callback:callback, refs:refs};
			for (i = 0; i < keys.length; i++)
			{
				name = keys[i];
				if (require.pendingElements.hasOwnProperty(name)) {
					require.pendingElements[name][callbackID] = info;
					continue;
				}
				element = document.createElement("script");
				element.type = "text/javascript";
				modulePath = refs[name];
				var src;
				if (modulePath)
					src = modulePath + name
				else
					src = name
				if (require.path.length > 0)
					element.src = require.path + "/" + src + ".js";
				else
					element.src = src + ".js";
				head.appendChild(element);
				if (global.hasOwnProperty(name))
				{
					//Handle synchronous load, though it may never happen?
					delete refs[name];
				}
				else {
					require.pendingElements[name] = {};
					require.pendingElements[name][callbackID] = info;
					require.remainingCallbacks += 1;
					element.onload = require.listener.bind(global, element);
				}
			}
			if (Object.keys(refs).length == 0) {
				// All elements loaded synchronously.
				callback.apply(global);
			}
		}
	};

	// base path for scripts
	require.path = null;
	require._srcPattern = /^(.*\/)?([^\/]*)$/;
	require.callbackID = 0;
	require.remainingCallbacks = 0;
	require.pendingElements = {}
	require.pollNames = {};
	require.previousKeysHash = null
	require.timeout = 0;
	require.timeoutInitial = 0;
	require.timeoutMax = -1;
	require.listener = function(element) {
		require.remainingCallbacks -= 1;
		var callbackIDs, callbacks, i, info, j,
			name, pollNames, remove, src;
		if (element != null) {
			src = element.src;
			element.onload = null;
			name = src.substring(src.lastIndexOf("/")+1, src.lastIndexOf("."));
			require.pollNames[name] = true;
		}

		/* Execute as many callbacks as possible in a loop, since
		 * each call can satisfy dependencies for the next loop.
		 */
		do {
			remove = []
			pollNames = Object.keys(require.pollNames);
			for (i = 0; i < pollNames.length; i++)
				if (global.hasOwnProperty(pollNames[i])) {
					name = pollNames[i];
					delete require.pollNames[name];
					callbacks = require.pendingElements[name];
					delete require.pendingElements[name];
					callbackIDs = Object.keys(callbacks);
					for (j = 0; j < callbackIDs.length; j++) {
						info = callbacks[callbackIDs[j]];
						delete info.refs[name];
						if (Object.keys(info.refs).length == 0)
							remove.push(info);
					}
				}

			for (i = 0; i < remove.length; i++)
				remove[i].callback.apply(global);
		}
		while (remove.length > 0);

		if (require.remainingCallbacks == 0) {
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
					throw "require timeout: " + keysHash
				if (require.previousKeysHash === null ||
					require.previousKeysHash != keysHash) {
					require.timeout = require.timeoutInitial;
				}
				else {
					if (require.timeout == 0)
						require.timeout = 1;
					else if (require.timeout >= require.timeoutMax)
						throw "require timeout: " + keysHash
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
	}

	return require;
}(this));
