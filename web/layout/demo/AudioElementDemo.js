
loadTheme("../..", function(shockTherapyConfig,
	resourceFactory, resources) {
	var audio = document.createElement("audio");

	var source = audio.ownerDocument.createElement("source");
	source.src = "../../sounds/electric_discharge_10s.ogg";
	source.type = "audio/ogg";
	audio.appendChild(source);

	source = audio.ownerDocument.createElement("source");
	source.src = "../../sounds/electric_discharge_10s.mp3";
	source.type = "audio/mpeg";
	audio.appendChild(source);

	audio.width = 0;
	audio.height = 0;
	audio.style.setProperty("display", "none", null);

	audio.ownerDocument.body.appendChild(audio);

	var loadButton = document.getElementById("load");
	loadButton.addEventListener("click", function(e) {
		audio.load();
	});
	var playButton = document.getElementById("play");
	playButton.addEventListener("click", function(e) {
		audio.play();
	});
	var pauseButton = document.getElementById("pause");
	pauseButton.addEventListener("click", function(e) {
		audio.pause();
	});
	var restartButton = document.getElementById("restart");
	restartButton.addEventListener("click", function(e) {
		audio.currentTime = 0;
	});
});
