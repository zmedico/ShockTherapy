
(function(global) {
	var onload = function() {

		require([
			"ShockTherapyReadonlyConfig",
			"ShockTherapyWidget"
		], function() {
			var shockTherapyConfig =
				new ShockTherapyReadonlyConfig(
					{
						"Interactive": "false",
						"Sound": "false"
					}
				);

			var widget = new ShockTherapyWidget("../..", shockTherapyConfig,
				window.document.getElementById("mainCanvas"));

			var resize_timeout_id = null;
			var resize = function() {
				widget.canvas.width = window.innerWidth;
				widget.canvas.height = window.innerHeight;
				resize_timeout_id = null;
			};
			resize();

			window.addEventListener("resize", function() {
				if (resize_timeout_id === null)
				{
					resize_timeout_id = window.setTimeout(resize, 250);
				}
			});

			var user_stopped = false;
			var window_focus = true;
			var animate_timeout_id = null;

			var animate = function() {
				if (!window_focus)
					return;
				if (user_stopped) {
					widget.stop();
					return;
				}

				/** Ensure that we never have more than one timeout
				scheduled at a time. **/
				if (animate_timeout_id !== null)
					window.clearTimeout(animate_timeout_id)

				var w = widget.canvas.width,
					h = widget.canvas.height,
					rand = w * h * Math.random(),
					y = rand / w,
					x = rand % w;
				if (widget.running) {
					widget.stop();
					animate_timeout_id = window.setTimeout(animate,
						500 + Math.round(500 * Math.random()));
				}
				else {
					widget.moveTarget(x, y);
					widget.start();
					animate_timeout_id = window.setTimeout(animate,
						Math.round(500 * Math.random()));
				}
			}

			window.addEventListener("blur", function() {
				window_focus = false;
				widget.stop();
			});
			window.addEventListener("focus", function() {
				window_focus = true;
				animate();
			});

			widget.canvas.addEventListener("click", function() {
				user_stopped = !user_stopped;
				if (user_stopped)
					widget.stop();
				else
					animate();
			});

			animate();
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
