
define([
	"addPointerEventListener",
	"animFrame",
	"extend",
	"CanvasWidget",
	"ElectricArc",
	"ShockTherapy",
	"ShockTherapyDefaults"
], function(addPointerEventListener, animFrame, extend, CanvasWidget,
	ElectricArc, ShockTherapy, ShockTherapyDefaults) {

	var global = this;

	var constructor = function(baseuri, config, element)
	{
		constructor.base.constructor.call(this, this, element);
		this.baseuri = baseuri;
		this.config = config;
		this._removePointerListener = null;
		this.drawableCount = 1;
		this.target = {x: 0, y: 0};
		this.frameCounter = {frames: null, startTime: null};
		this.lastDrawTimestamp = null;
		this.vibrating = false;
		this.android = ShockTherapy.android;
		this.audio = null;
		this.AudioContext =
			global.AudioContext || global.webkitAudioContext || null
		// pre-init audio for next click
		this._initAudio();
		this.audioPlaying = false;
		this.running = false;
		this.drawables = new Array(this.drawableCount);
		this.arcColor = new ElectricArcColor();
		for (var i = 0; i < this.drawableCount ; i++)
		{
			this.drawables[i] = new ElectricArc(
				this.target, this.frameCounter, this.arcColor);
		}

		this._boundStartLater = this._startLater.bind(this);
		this._touchStartTime = null;
		this._startInterval = null;
		this._animateTimeout = null;
		this._animateRequest = null;

		/* As a workaround for repaint failures with Android 4.4.4,
		retry screen blanking. */
		this._screenBlankTimeout = null;
		this._screenBlankInterval = 50;
		this._screenBlankCount = 0;
		this._screenBlankMax = 8;
		this._screenBlankAnimFrameID = null;
	}

	extend(CanvasWidget, constructor);

	Object.defineProperty(constructor.prototype, "interactive", {
		get : function () {
			return this._removePointerListener !== null;
		},
		set : function (val) {
			if (val) {
				if (this._removePointerListener === null) {
					this._removePointerListener =
						addPointerEventListener(this.canvas, this);
				}
			}
			else {
				if (this._removePointerListener !== null) {
					this._removePointerListener();
					this._removePointerListener = null;
				}
			}
		}
	});

	constructor.prototype._initAudio = function() {
		if (this.android) {
		}
		else if (this.AudioContext !== null) {
			require(["WebAudioLoopManager"],
			(function(WebAudioLoopManager) {
				this.audio = new WebAudioLoopManager(
					new this.AudioContext(),
					[
						{
							type: "audio/wav",
							src: this.baseuri +
								"/sounds/electric_discharge.wav"
						},
					]
				);
			}).bind(this));
		}
		else {
			require(["AudioElementLoopManager"],
				(function(AudioElementLoopManager) {
				this.audio = new AudioElementLoopManager(
					this.canvas.ownerDocument,
					[
						{
							type: "audio/ogg",
							src: this.baseuri +
								"/sounds/electric_discharge_10s.ogg"
						},
						{
							type: "audio/mpeg",
							src: this.baseuri +
								"/sounds/electric_discharge_10s.mp3"
						}
					]
				);
			}).bind(this));
		}
	}

	constructor.prototype.startAudioLoop = function(name)
	{
		var volume = this.config.getFloat("SoundVolume",
				ShockTherapyDefaults.SoundVolume) / 100;
		if (this.android)
		{
			if (global.Android)
				global.Android.startSoundLoop(this.audioName, volume);
		}
		else if (this.audio !== null) {
			this.audio.volume = volume;
			this.audio.play();
		}
	}

	constructor.prototype.pauseAudioLoop = function(name)
	{
		if (this.android)
		{
			if (global.Android)
				global.Android.stopSoundLoop(this.audioName);
		}
		else if (this.audio !== null) {
			this.audio.pause()
		}
	}

	constructor.prototype.moveTarget = function(x, y)
	{
		var box = this.getContentBox();
		this.target.x = x;
		this.target.y = y;
		if (this.target.x < 1)
			this.target.x = 1;
		else if (this.target.x > box.w - 2)
			this.target.x = box.w - 2;
		if (this.target.y < 1)
			this.target.y = 1;
		else if (this.target.y > box.h - 2)
			this.target.y = box.h - 2;
	}

	constructor.prototype.onMouseMove = function(e)
	{
		var offset = this.getPointerOffset(e);
		this.moveTarget(offset.x, offset.y);
	}

	constructor.prototype.onMouseDown = function(e)
	{

		if (!(e.which && e.which != 1) && !this.running) {
			this.fireEvent("click");
			var offset = this.getPointerOffset(e);
			this.moveTarget(offset.x, offset.y);

			/* Ignore duplicate touchstart/touchend event pairs triggered
			by a short single tap in Android 4.1.1 WebView. If we don't ignore
			these events then they trigger a quick start/stop cycle that
			creates an unintended echo-like effect. */
			if (this.android) {
				this._touchStartTime = new Date().getTime();
				if (this._startInterval === null)
					this._startInterval = window.setInterval(
						this._boundStartLater, 20);
			}
			else
				this.start();
		}
		return false;
	}

	constructor.prototype._startLater = function() {
		if ((new Date().getTime() - this._touchStartTime) >= 20) {
			if (this._startInterval !== null) {
				window.clearInterval(this._startInterval);
				this._startInterval = null;
			}
			this._touchStartTime = null;
			this.start();
		}
	}

	constructor.prototype.start = function() {
		if (!this.running) {
			this.running = true;
			this.frameCounter.startTime = new Date().getTime();
			this.frameCounter.frames = 0;
			var box = this.getContentBox();
			this.canvas.width = box.w;
			this.canvas.height = box.h;
			
			if (this.config.getBoolean("Sound", ShockTherapyDefaults.Sound))
			{
				this.audioPlaying = true;
				this.startAudioLoop(this.audioName);
			}
			if (this.android &&
				this.config.getBoolean("Vibrator", ShockTherapyDefaults.Vibrator))
			{
				var vibratorIntensity = this.config.getFloat("VibratorIntensity",
					ShockTherapyDefaults.VibratorIntensity) / 100;
				this.vibrating = true;
				global.Android.startVibrator(vibratorIntensity);
			}
			this.arcColor.color.setStyle(
				this.config.getString("Color", ShockTherapyDefaults.Color));
			this.arcColor.hueVariance = this.config.getFloat("HueVariance",
				ShockTherapyDefaults.HueVariance);
			this.arcColor.brightnessVariance = this.config.getFloat("BrightnessVariance",
				ShockTherapyDefaults.BrightnessVariance);

			var thickness = this.config.getFloat("Thickness",
				ShockTherapyDefaults.Thickness);
			var density = this.config.getFloat("Density",
				ShockTherapyDefaults.Density);
			for (var i = 0; i < this.drawableCount ; i++)
			{
				this.drawables[i].thickness = thickness;
				this.drawables[i].density = density;
			}

			var duration = 2 * this.config.getFloat("Duration",
				ShockTherapyDefaults.Duration);

			var _this = this
			var delayedAnimate = function()
			{
				_this._requestAnimFrame(animate);
			}
			var animate = function()
				{
					if (_this.running)
					{
						var durationPause = false;
						if (duration != 0 && _this.lastDrawTimestamp != null)
						{
							var currentTime = new Date().getTime();
							if ((currentTime - _this.lastDrawTimestamp) < duration)
							{
								// Trigger a delayed requestAnimationFrame call
								// instead of a direct timeout, since rendering
								// performance should be optimal during
								// requestAnimationFrame calls.
								durationPause = true;
								if (_this._animateTimeout !== null)
									clearTimeout(_this._animateTimeout);
								_this._animateTimeout = window.setTimeout(
									delayedAnimate,
									duration - (currentTime - _this.lastDrawTimestamp));
							}
						}
						if (!durationPause)
						{
							_this._requestAnimFrame(animate);
							_this.lastDrawTimestamp = new Date().getTime();
							_this.frameCounter.frames++;
							_this.repaint();
						}
					}
				}
				this._requestAnimFrame(animate);
		}
	}

	constructor.prototype._requestAnimFrame = function(func)
	{
		if (this._animateRequest !== null)
			animFrame.cancel(this._animateRequest);
		this._animateRequest = animFrame.request(func);
	}

	constructor.prototype.onMouseUp = function(e)
	{
		if (!(e.which && e.which != 1)) {
			if (this.running)
				this.stop()
			else if (this._startInterval !== null) {
				/* If the touchend event arrives before this interval
				has cleared itself, then the touchstart/touchend pair
				is discarded as a duplicate. */
				window.clearInterval(this._startInterval);
				this._startInterval = null;
			}
		}
		return false;
	}

	constructor.prototype.stop = function() {
		if (this.running) {
			if (this._startInterval !== null) {
				window.clearInterval(this._startInterval);
				this._startInterval = null;
			}
			if (this._animateRequest !== null)
			{
				animFrame.cancel(this._animateRequest);
				this._animateRequest = null;
			}
			if (this._animateTimeout !== null) {
				clearTimeout(this._animateTimeout);
				this._animateTimeout = null;
			}
			this.running = false;
			this.frameCounter.startTime = null;
			this.frameCounter.frames = null;
			this.lastDrawTimestamp = null;
			if (this.audioPlaying)
			{
				this.pauseAudioLoop(this.audioName);
				this.audioPlaying = false;
			}
			if (this.vibrating)
			{
				global.Android.stopVibrator();
			}
			this._screenBlankCount = 0;
			this._screenBlank();
		}
	}

	constructor.prototype._screenBlank = function() {
		if (this._screenBlankTimeout !== null)
			window.clearTimeout(this._screenBlankTimeout)
		this._screenBlankTimeout = window.setTimeout(
			this._screenBlankTimeoutCB.bind(this),
			this._screenBlankInterval);
	}

	constructor.prototype._screenBlankTimeoutCB = function() {
		this._screenBlankTimeout = null;
		if (this.running)
			return

		if (this._screenBlankAnimFrameID !== null)
			animFrame.cancel(this._screenBlankAnimFrameID);

		this._screenBlankAnimFrameID = this._requestAnimFrame(
			this._screenBlankAnimFrame.bind(this));
	}

	constructor.prototype._screenBlankAnimFrame = function() {
		if (this.running)
			return

		this.repaint();
		this._screenBlankCount += 1;
		if (this._screenBlankCount < this._screenBlankMax)
			this._screenBlank();
	}

	constructor.prototype.eraseCanvas = function(context)
	{
		var canvasStyle = this.canvas.ownerDocument.defaultView.getComputedStyle(this.canvas);
		var box = this.getContentBox();
		context.globalCompositeOperation = "source-over"
		context.beginPath();
		context.fillStyle = canvasStyle.getPropertyValue("background-color");
		/* If page zoom is in effect, then it may be necessary to
		add 1 to the width and height here, in order to ensure that
		the whole canvas is erased. */
		context.fillRect(box.x, box.y, box.w + 1, box.h + 1);
		context.fill();
	}

	constructor.prototype.draw = function(context)
	{
		this.eraseCanvas(context);
		if (this.running) {
			var box = this.getContentBox();
			for (var i = 0; i < this.drawables.length; i++)
			{
				this.drawables[i].setBounds(box);
				this.drawables[i].draw(context);
			}
		}
	}

	return constructor;

});
