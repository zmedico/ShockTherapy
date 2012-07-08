
(function(global) {
	var onload = function() {

		require([
			"ShockTherapyReadonlyConfig",
			"ShockTherapyWidget",
			"../lib/jsgif/encode64",
			"../lib/jsgif/GIFEncoder",
			"../lib/jsgif/LZWEncoder",
			"../lib/jsgif/NeuQuant"
		], function() {

			var DEFAULT_QUALITY = 10,
				DEFAULT_DURATION = 3,
				DEFAULT_DELAY = 50,
				DEFAULT_WIDTH = 280,
				DEFAULT_HEIGHT = 160;

			var params = {};
			if (window.location.hash) {
				var a, paramsSplit = window.location.hash.substr(1).split("&");

				for (i = 0; i < paramsSplit.length; i++)
				{
					a = paramsSplit[i].split("=");
					if (a.length == 2)
						params[a[0]] = a[1];
				}
			}

			if (params.hasOwnProperty("quality"))
				params.quality = parseInt(params.quality)
			if (!params.quality || params.quality === Number.NaN)
				params.quality = DEFAULT_QUALITY;

			if (params.hasOwnProperty("duration"))
				params.duration = parseInt(params.duration)
			if (!params.duration || params.duration === Number.NaN)
				params.duration = DEFAULT_DURATION;

			if (params.hasOwnProperty("delay"))
				params.delay = parseInt(params.delay)
			if (!params.delay || params.delay === Number.NaN)
				params.delay = DEFAULT_DELAY;

			if (params.hasOwnProperty("width"))
				params.width = parseInt(params.width)
			if (!params.width || params.width === Number.NaN)
				params.width = DEFAULT_WIDTH;

			if (params.hasOwnProperty("height"))
				params.height = parseInt(params.height)
			if (!params.height || params.height === Number.NaN)
				params.height = DEFAULT_HEIGHT;

			/* Update window.location.hash to reflect all of the
			current parameters.*/
			var keys = Object.keys(params);
			keys.sort();
			var paramsSplit = [];
			for (var i = 0; i < keys.length; i++)
				paramsSplit.push(keys[i] + "=" + params[keys[i]])
			window.location.hash = "#" + paramsSplit.join("&");

			window.addEventListener("hashchange", function() {
					window.location.reload();
				}, false);

			//console.log(JSON.stringify(params, null, "\t"));

			var shockTherapyConfig =
				new ShockTherapyReadonlyConfig(
					{
						"Sound": "false"
					}
				);

			var widget = new ShockTherapyWidget("../..", shockTherapyConfig,
				window.document.getElementById("mainCanvas"));

			widget.canvas.width = params.width;
			widget.canvas.height = params.height;

			/** Page zoom will scale the width and height, so
			find out what the real effective values are. **/
			var width = widget.canvas.clientWidth;
			var height = widget.canvas.clientHeight;
			//console.log("width: " + width);
			//console.log("height: " + height);

			var animateTimeoutId = null;
			var encoder = null;
			var gifIntervalId = null;
			var gifFrameCount = params.duration *
				1000 / params.delay;
			var gifFrames = [];

			var processFrames = function() {
				var image = gifFrames.pop();
				widget.canvas.getContext("2d").putImageData(image, 0, 0);
				var result = encoder.addFrame(image.data, true);
				if (!result)
					throw "encoder.addFrame(): " + result;
				if (gifFrames.length == 0) {
					gifFrames = null;
					result = encoder.finish();
					if (!result)
						throw "encoder.finish(): " + result;
					var imgElement =
						widget.canvas.ownerDocument.createElement("img");
					imgElement.src = "data:image/gif;base64," +
						encode64(encoder.stream().getData())
					widget.canvas.parentNode.appendChild(imgElement);
					widget.canvas.parentNode.removeChild(widget.canvas);
				}
				else
					window.setTimeout(processFrames, 0);
			}

			var addFrame = function() {
				gifFrames.push(widget.canvas.getContext("2d").getImageData(
					0, 0, width, height));
				if (--gifFrameCount <= 0) {
					widget.stop();
					window.clearInterval(gifIntervalId);
					gifIntervalId = null;

					if (animateTimeoutId !== null) {
						window.clearTimeout(animateTimeoutId);
						animateTimeoutId = null;
					}

					encoder = new GIFEncoder();
					encoder.setQuality(params.quality);
					encoder.setSize(width, height);
					encoder.setRepeat(0); //auto-loop
					encoder.setDelay(params.delay);
					var result = encoder.start();
					if (!result)
						throw "encoder.start(): " + result;
					gifFrames.reverse();
					processFrames();
				}
			}

			var animate = function() {

				var w = width,
					h = height,
					rand = w * h * Math.random(),
					y = rand / w,
					x = rand % w;
				if (widget.running) {
					widget.stop();
					animateTimeoutId = window.setTimeout(animate,
						500 + Math.round(500 * Math.random()));
				}
				else {
					widget.moveTarget(x, y);
					widget.start();
					animateTimeoutId = window.setTimeout(animate,
						Math.round(500 * Math.random()));
				}
			}

			animate();

			gifIntervalId = window.setInterval(addFrame, params.delay);
		});
	};

	if (document.readyState == "complete")
		onload();
	else {
		var listener = function (e) {
			if (document.readyState == "complete") {
				document.removeEventListener(
					"readystatechange", listener);
				onload.apply(global);
			}
		};
		document.addEventListener("readystatechange", listener);
	}

})(this);
