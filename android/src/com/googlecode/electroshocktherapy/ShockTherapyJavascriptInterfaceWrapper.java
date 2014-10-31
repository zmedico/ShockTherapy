package com.googlecode.electroshocktherapy;

import android.webkit.JavascriptInterface;

/**
 * Wraps a ShockTherapyJavascriptInterface instance in order to
 * apply @JavascriptInterface annotations which are required
 * since targetSdkVersion 17.
 */
public class ShockTherapyJavascriptInterfaceWrapper implements ShockTherapyJavascriptInterface {

	private ShockTherapyJavascriptInterface imp;

	public ShockTherapyJavascriptInterfaceWrapper(ShockTherapyJavascriptInterface imp) {
		this.imp = imp;
	}

	@JavascriptInterface
	public void viewChanged(String url) {
		this.imp.viewChanged(url);
	}

	@JavascriptInterface
	public boolean hardwareMenuButtonRequired() {
		return this.imp.hardwareMenuButtonRequired();
	}

	@JavascriptInterface
	public void startSoundLoop(String name, float volume) {
		this.imp.startSoundLoop(name, volume);
	}

	@JavascriptInterface
	public void stopSoundLoop(String name) {
		this.imp.stopSoundLoop(name);
	}

	@JavascriptInterface
	public void startVibrator(float intensity) {
		this.imp.startVibrator(intensity);
	}

	@JavascriptInterface
	public void stopVibrator() {
		this.imp.stopVibrator();
	}

	@JavascriptInterface
	public String getItem(String key) {
		return this.imp.getItem(key);
	}

	@JavascriptInterface
	public void setItem(String key, String value) {
		this.imp.setItem(key, value);
	}

	@JavascriptInterface
	public void remove(String key) {
		this.imp.remove(key);
	}

	@JavascriptInterface
	public void getTextFile(String mimeType, String encoding, String prompt) {
		this.imp.getTextFile(mimeType, encoding, prompt);
	}

	@JavascriptInterface
	public void saveFile(String prompt, String fileName,
		String mimeType, String encoding, String content) {
		this.imp.saveFile(prompt, fileName, mimeType, encoding, content);
	}
}
