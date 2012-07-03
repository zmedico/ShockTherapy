
require([
	"extend",
	"CanvasWidget",
	"ElectricArc",
	"requestAnimFrame",
	"ShockTherapy",
	"ShockTherapyDefaults"
], function() {

this.ShockTherapyWidget = (function(global) {

	var constructor = function(baseuri, config, element)
	{
		constructor.base.constructor.call(this, this, element);
		this.baseuri = baseuri;
		this.config = config;
		this.drawableCount = 1;
		this.target = {x: 0, y: 0};
		this.frameCounter = {frames: null, startTime: null};
		this.lastDrawTimestamp = null;
		this.vibrating = false;
		this.android = ShockTherapy.android;
		this.audio = null;
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
	}

	extend(CanvasWidget, constructor);

	constructor.prototype._initAudio = function() {
		if (!this.android) {
			require(["AudioElementLoopManager"], (function() {
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

	constructor.prototype.moveTarget = function(e)
	{
		var box, pointer;
		pointer = this.getPointerOffset(e);
		box = this.getContentBox();
		this.target.x = pointer.x;
		this.target.y = pointer.y;
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
		this.moveTarget(e);
	}

	constructor.prototype.onMouseDown = function(e)
	{

		if (!(e.which && e.which != 1) && !this.running)
		{
			this.fireEvent("click");
			this.running = true;
			this.frameCounter.startTime = new Date().getTime();
			this.frameCounter.frames = 0;
			var box = this.getContentBox();
			this.canvas.width = box.w;
			this.canvas.height = box.h;
			this.moveTarget(e);
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
				requestAnimFrame(animate);
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
								_this.canvas.ownerDocument.defaultView.setTimeout(
									delayedAnimate,
									duration - (currentTime - _this.lastDrawTimestamp));
							}
						}
						if (!durationPause)
						{
							requestAnimFrame(animate);
							_this.lastDrawTimestamp = new Date().getTime();
							_this.frameCounter.frames++;
							_this.repaint();
						}
					}
				}
			requestAnimFrame( animate );
		}

		return false;
	}

	constructor.prototype.onMouseUp = function(e)
	{
		if (!(e.which && e.which != 1) && this.running)
		{
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
			this.repaint();
		}

		return false;
	}

	constructor.prototype.eraseCanvas = function(context)
	{
		var canvasStyle = this.canvas.ownerDocument.defaultView.getComputedStyle(this.canvas);
		var box = this.getContentBox();
		context.globalCompositeOperation = "source-over"
		context.beginPath();
		context.fillStyle = canvasStyle.getPropertyValue("background-color");
		context.fillRect(box.x, box.y, box.w, box.h);
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

}(this));

});
