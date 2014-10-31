package com.googlecode.electroshocktherapy;

public interface ShockTherapyJavascriptInterface {

	public void viewChanged(String url);

	public boolean hardwareMenuButtonRequired();

	public void startSoundLoop(String name, float volume);

	public void stopSoundLoop(String name);

	public void startVibrator(float intensity);

	public void stopVibrator();

	public String getItem(String key);

	public void setItem(String key, String value);

	public void remove(String key);

	public void getTextFile(String mimeType, String encoding, String prompt);

	public void saveFile(String prompt, String fileName,
			String mimeType, String encoding, String content);
}
