
this.AudioElementLoopManager = (function(global) {

	var constructor = function(ownerDocument, sources)
	{
		this.ownerDocument = ownerDocument
		this.sources = sources;
		this.audio = null;
		this.audioError = false;
		this.playing = false;
		this.volume = 1.0;
		// pre-init audio for first play
		this._initAudio();
	}

	constructor.prototype._initAudio = function() {
		if (this.audio !== null)
			this.ownerDocument.body.removeChild(this.audio);
		this.audio = this.ownerDocument.createElement("audio");
		try {
			var source, i;
			for (i = 0; i < this.sources.length; i++) {
				source = this.ownerDocument.createElement("source");
				source.type = this.sources[i].type;
				source.src = this.sources[i].src;
				this.audio.appendChild(source);
			}

			// Add it to the body as an invisible element, so that
			// document.getElementsByTagName("audio") works in
			// a JavaScript console.
			this.audio.width = 0;
			this.audio.height = 0;
			this.audio.style.setProperty("display", "none", null);
			this.ownerDocument.body.appendChild(this.audio);
			this.audio.load();

			// NOTE: looping terminates in chrome 16 after the second loop
			// when using the loop attribute, so use an "ended" event
			// listen to get the desired behavior.
			//this.audio.loop = true;
			this.audio.addEventListener("ended", (function() {
				if (this.playing)
				{
					this.play();
				}
			}).bind(this), false);
		}
		catch (e) {
			this.ownerDocument.defaultView.setTimeout(function() {
					throw e;
				}, 0);
			this.audioError = True;
		}
	}

	constructor.prototype.play = function() {
		this.playing = true;
		if (!this.audioError)
		{
			try {
				this.audio.volume = this.volume;
				this.audio.play();
			}
			catch (e) {
				this.ownerDocument.defaultView.setTimeout(function() {
						throw e;
					}, 0);
				this.audioError = true;
			}
		}
	}

	constructor.prototype.pause = function() {
		this.playing = false;
		if (!this.audioError)
		{
			try {
				this.audio.pause();
			}
			catch (e) {
				this.ownerDocument.defaultView.setTimeout(function() {
						throw e;
					}, 0);
				this.audioError = true;
			}
		}
	}

	return constructor;

}(this));
