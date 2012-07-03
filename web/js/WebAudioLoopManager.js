
this.WebAudioLoopManager = (function(global) {

	var constructor = function(context, sources)
	{
		this.context = context
		this.sources = sources;
		this._buffer = null;
		this._buffer_source = null;
		this._gainNode = context.createGainNode();
		this._gainNode.connect(context.destination);
		this._error = null;
		this.playing = false;
		// pre-init audio for first play
		this._initAudio();
	}

	Object.defineProperty(constructor.prototype, "volume", {
		get : function () {
			return this._gainNode.gain.value;
		},
		set : function (val) {
			this._gainNode.gain.value = val;
		}
	});

	constructor.prototype._initAudio = function() {

		this._request = new XMLHttpRequest();
		this._request.open("GET", this.sources[0].src, true);
		this._request.responseType = "arraybuffer";
		this._request.onload = this._onload.bind(this);
		this._request.send();
	}

	constructor.prototype._onload = function() {
		this.context.decodeAudioData(this._request.response,
			this._ondecode.bind(this));
		this._request = null;
	}

	constructor.prototype._ondecode = function(buffer) {
        if (!buffer) {
			this._error = "error decoding file data: " + this.sources[0].src;
			global.window.setTimeout(function() { throw this._error; }, 0);
        }
        else
			this._buffer = buffer
	}

	constructor.prototype.play = function() {

		if (this._buffer_source !== null)
			this.pause();

		this.playing = true;
		if (this._buffer !== null && !this._error)
		{
			var source = this.context.createBufferSource();
			this._buffer_source = source;
			source.buffer = this._buffer;
			source.loop = true;
			source.connect(this._gainNode);
			source.noteOn(0);
		}
	}

	constructor.prototype.pause = function() {
		this.playing = false;
		if (!this._error)
		{
			if (this._buffer_source !== null) {
				this._buffer_source.noteOff(0);
				// noteOn() and noteOff() can only be called once
				// for a given AudioBufferSourceNode
				this._buffer_source.disconnect(0);
				this._buffer_source = null;
			}
		}
	}

	return constructor;

}(this));
