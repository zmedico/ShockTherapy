package com.googlecode.electroshocktherapy;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;

import org.openintents.intents.FileManagerIntents;
import com.googlecode.electroshocktherapy.R;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.os.Vibrator;
import android.provider.MediaStore;
//import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
//import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class ShockTherapyActivity extends Activity {

	private static final String ANROID_USER_AGENT = "android:com.googlecode.electroshocktherapy";
	private static final String HOMEPAGE ="http://electroshocktherapy.googlecode.com/";
	private static final String BASE_URL = "file:///android_asset/layout/";
	private static final String MAIN_URL = BASE_URL + "main.html";
	private static final String OPTIONS_URL = MAIN_URL + "#options";
	private static final String ABOUT_URL = MAIN_URL + "#about";
	private static final String GO_BACK = "javascript:ShockTherapy.goBack()";
	private static final String FILE_CHOOSER_LOC = "FileChooser";
	private static final String DEFAULT_EXPORT_FILE_NAME = "ShockTherapyOptions.json";
	private static final int SOUND_RESOURCE = R.raw.electric_discharge_5_clicks;
	private static final int WEBVIEW_FILE_INPUT_RESULTCODE = RESULT_FIRST_USER;
	private static final int WEBVIEW_FILE_INPUT_JS_RESULTCODE = RESULT_FIRST_USER + 1;
	private static final int WEBVIEW_FILE_INPUT_JS_OI_RESULTCODE = RESULT_FIRST_USER + 2;
	private static final int WEBVIEW_FILE_OUTPUT_RESULTCODE = RESULT_FIRST_USER + 3;
	private static final int WEBVIEW_FILE_OUTPUT_OI_RESULTCODE = RESULT_FIRST_USER + 4;

	private WebView webview;
	private MediaPlayer mediaPlayer;
	private ValueCallback<Uri> webviewFileInputCb;
	private HashMap<String,String> webviewFileInputRequest;
	private String webviewFileOutputDataUrl;
	private String url;
	private String anchor;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		webview = (WebView) findViewById(R.id.webview);
		webview.setWebViewClient(new WebViewClientOverride());
		webview.setWebChromeClient(new WebChromeClientOverride());

		webview.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
		webview.getSettings().setUserAgentString(
			webview.getSettings().getUserAgentString() + " " +
			ANROID_USER_AGENT);
		webview.getSettings().setJavaScriptEnabled(true);
		webview.addJavascriptInterface(new JavaScriptInterface(), "Android");

		String oldUrl = null;
		if (savedInstanceState != null)
			// restored url after an orientation change
			// triggers reload
			oldUrl = savedInstanceState.getString("url");

		if (oldUrl == null || oldUrl.equals(MAIN_URL))
			loadUrl(MAIN_URL);
		else if (oldUrl.equals(OPTIONS_URL))
			loadUrl(OPTIONS_URL);
		else if (oldUrl.equals(ABOUT_URL))
			loadUrl(ABOUT_URL);
		else
			loadUrl(MAIN_URL);
	}

	protected void onSaveInstanceState(Bundle outState) {
		// save the url so it can be restored after
		// an orientation change triggers reload
		outState.putString("url", url);
	}

	protected void onPostResume () {
		super.onPostResume();
		/* Re-initialize the JavaScriptInterface since otherwise it
		 * sometimes fails to deliver events. Don't use webview.reload(),
		 * since we also need to workaround Android Issue 17327 here.
		 */
		loadUrl(url, true);
	}

	/**
	* Called when your activity's options menu needs to be created.
	*/
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		super.onCreateOptionsMenu(menu);
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.options_menu, menu);
		return true;
	}

	/**
	* Called right before your activity's option menu is displayed.
	*/
	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
		super.onPrepareOptionsMenu(menu);

		// Before showing the menu, we need to decide whether the clear
		// item is enabled depending on whether there is text to clear.
		menu.findItem(R.id.options_menu).setVisible(
			!url.equals(OPTIONS_URL));
		menu.findItem(R.id.about_menu).setVisible(
			!url.equals(ABOUT_URL));
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle item selection
		switch (item.getItemId()) {
		case R.id.options_menu:
			loadUrl(OPTIONS_URL);
			return true;
		case R.id.about_menu:
			loadUrl(ABOUT_URL);
			return true;
		default:
			return super.onOptionsItemSelected(item);
		}
	}

	@Override
	public void onBackPressed() {
		if (url.equals(MAIN_URL))
		{
			super.onBackPressed();
		}
		else
		{
			webview.loadUrl(GO_BACK);
		}
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (mediaPlayer != null) {
			mediaPlayer.release();
			mediaPlayer = null;
		}
	}

	@Override
	public void onWindowFocusChanged (boolean hasFocus) {
		super.onWindowFocusChanged(hasFocus);
		/* Pause the media player if focus changes for some reason.
		* This can happen if the user turns of the screen while
		* sound is playing.
		*/
		if (mediaPlayer != null)
		{
			mediaPlayer.pause();
			mediaPlayer.seekTo(0);
		}
	}

	private void loadUrl(String uri) {
		loadUrl(uri, false);
	}

	private void loadUrl(String uri, boolean reload) {
		String previous = url;
		url = uri;
		anchor = Uri.parse(uri).getFragment();
		if (anchor != null) {
			/* Workaround for Android Issue 17327:
			 * http://code.google.com/p/android/issues/detail?id=17327
			 * http://stackoverflow.com/questions/6542702/basic-internal-links-dont-work-in-honeycomb-app
			 * TODO: Fix history/back button handling to account for this.
			 */
			uri = uri.substring(0, uri.indexOf("#"));
			if (!reload && previous != null &&
				uri.length() <= previous.length() &&
				previous.substring(0, uri.length()).equals(uri)) {
				// Optimize menu clicks to avoid page reloads.
				String jsUri = "javascript:window.location.hash='#"
					+ anchor + "'";
				anchor = null;
				webview.loadUrl(jsUri);
				return;
			}
		}
		webview.loadUrl(uri);
	}

	private MediaPlayer getMediaPlayer() {
		if (mediaPlayer == null)
		{
			mediaPlayer = MediaPlayer.create(this, SOUND_RESOURCE);
			mediaPlayer.setLooping(true);
		}
		return mediaPlayer;
	}

	public String getItem(String key) {
		return getPreferences(MODE_PRIVATE).getString(key, null);
	}

	public void setItem(String key, String value) {
		SharedPreferences.Editor editor = getPreferences(MODE_PRIVATE).edit();
		editor.putString(key, value);
		editor.apply();
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode,
			Intent intent) {
		String chosenFile = null;
		switch (requestCode) {
		case WEBVIEW_FILE_INPUT_RESULTCODE:
			if (webviewFileInputCb != null) {
				if (intent != null && resultCode == RESULT_OK) {
					webviewFileInputCb.onReceiveValue(intent.getData());
				}
				webviewFileInputCb = null;
			}
			break;

		case WEBVIEW_FILE_INPUT_JS_RESULTCODE:
		case WEBVIEW_FILE_INPUT_JS_OI_RESULTCODE:
			if (webviewFileInputRequest != null) {
				if (intent != null && resultCode == RESULT_OK) {
					if (requestCode == WEBVIEW_FILE_INPUT_JS_RESULTCODE) {
						Cursor c = getContentResolver().query(intent.getData(),
							new String[] {MediaStore.MediaColumns.DATA},
						null, null, null);
						if (c != null && c.moveToFirst()){
							do {
								int id = c.getColumnIndex(
									MediaStore.MediaColumns.DATA);
								if (id != -1) {
									chosenFile = c.getString(id);
									break;
								}
							} while (c.moveToNext());
						}
					}
					else {
						Uri fileUri = intent.getData();
						if (fileUri != null)
							chosenFile = fileUri.getPath();
					}
					if (chosenFile != null) {
						try {
							BufferedReader f = new BufferedReader(
								new InputStreamReader(new FileInputStream(chosenFile),
								webviewFileInputRequest.get("encoding")));
							StringBuffer content = new StringBuffer();
							String line;
							while((line = f.readLine()) != null)
								content.append(line);
							f.close();
							String jsUri = content.toString();
							jsUri = jsUri.replace("\"", "\\\"");
							jsUri = "javascript:androidGetTextFileCb(\"" + jsUri + "\")";
							webview.loadUrl(jsUri);
						}
						catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
				webviewFileInputRequest = null;
			}
			break;

		case WEBVIEW_FILE_OUTPUT_OI_RESULTCODE:
			if (webviewFileOutputDataUrl != null) {
				if (intent != null && resultCode == RESULT_OK)
				{
					String outputData = Uri.decode(
						webviewFileOutputDataUrl).substring(
						"data:,".length());

					Uri fileUri = intent.getData();
					if (fileUri != null) {
						chosenFile = fileUri.getPath();
						if (chosenFile != null) {
							try {
								FileWriter f = new FileWriter(chosenFile);
								f.write(outputData);
								f.close();
							}
							catch (IOException e) {
								e.printStackTrace();
							}
						}
					}
				}
				webviewFileOutputDataUrl = null;
			}
			break;

		case WEBVIEW_FILE_OUTPUT_RESULTCODE:
			if (webviewFileOutputDataUrl != null) {
				if (intent != null && resultCode == RESULT_OK)
				{
					String outputData = Uri.decode(
						webviewFileOutputDataUrl).substring(
						"data:,".length());
					Uri uri = intent.getData();
					Cursor c = getContentResolver().query(uri,
						new String[] {MediaStore.MediaColumns.DATA},
						null, null, null);
					if (c != null && c.moveToFirst()){
						do {
							int id = c.getColumnIndex(
								MediaStore.MediaColumns.DATA);
							if (id != -1) {
								chosenFile = c.getString(id);
								try {
									FileWriter f = new FileWriter(chosenFile);
									f.write(outputData);
									f.close();
								}
								catch (IOException e) {
									e.printStackTrace();
								}
								c.close();
								break;
							}
						} while (c.moveToNext());
					}
				}
				webviewFileOutputDataUrl = null;
			}
			break;
		}

		if (chosenFile != null)
			setItem(FILE_CHOOSER_LOC, chosenFile);

	}

	private class WebViewClientOverride extends WebViewClient {

		@Override
	    public void onPageFinished(WebView view, String url)
	    {
	        if (ShockTherapyActivity.this.anchor != null)
	        {
				// Workaround for Android Issue 17327.
				String anchor = ShockTherapyActivity.this.anchor;
				ShockTherapyActivity.this.anchor = null;
	            view.loadUrl("javascript:window.location.hash='#"
					+ anchor + "'");
	        }
	    }

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			//System.err.println("ShockTherapyActivity shouldOverrideUrlLoading:" + url);
			Uri uri = Uri.parse(url);

			if (url.equals(HOMEPAGE)) {
				Intent intent = new Intent(Intent.ACTION_VIEW, uri);
				startActivity(intent);
				return true;
			}

			else if (uri.getScheme().equals("mailto")) {
				final Intent intent = new Intent(Intent.ACTION_SEND);
				intent.setType("plain/text");
				intent.putExtra(Intent.EXTRA_EMAIL, new String[]{url.substring(7, url.length())});
				intent.putExtra(Intent.EXTRA_SUBJECT, "Shock Therapy");
				intent.putExtra(Intent.EXTRA_TEXT, "");
				startActivity(Intent.createChooser(intent, "Send mail..."));
				return true;
			}

			else if (!uri.getScheme().equals("data")) {
				return false;
			}
			// spawn an intent to choose an output file
			webviewFileOutputDataUrl = url;

			Intent intent = new Intent(FileManagerIntents.ACTION_PICK_FILE);

			// setup starting directory
			String fileName = getItem(FILE_CHOOSER_LOC);
			if (fileName == null)
				fileName = DEFAULT_EXPORT_FILE_NAME;
			intent.setData(Uri.fromFile(new File(fileName)));

			//intent.putExtra(FileManagerIntents.EXTRA_TITLE, getString(R.string.save_title));
			//intent.putExtra(FileManagerIntents.EXTRA_BUTTON_TEXT, getString(R.string.save_button));

			try {
				startActivityForResult(intent, WEBVIEW_FILE_OUTPUT_OI_RESULTCODE);
			} catch (ActivityNotFoundException e) {
				intent = new Intent(Intent.ACTION_GET_CONTENT);
				intent.setType("text/plain");
				//i.setType("*/*");
				intent.addCategory(Intent.CATEGORY_OPENABLE);
				ShockTherapyActivity.this.startActivityForResult(
					Intent.createChooser(intent, "File Chooser"),
					ShockTherapyActivity.WEBVIEW_FILE_OUTPUT_RESULTCODE);
			}

			return true;
		}
	}

	protected class WebChromeClientOverride extends WebChromeClient {
		/* http://developer.android.com/guide/webapps/debugging.html
		* ConsoleMessage available since API Level 8
		*/
		/*
		public boolean onConsoleMessage(ConsoleMessage cm) {
			Log.d("ShockTherapyActivity.webview", cm.message() + " -- From line "
								+ cm.lineNumber() + " of "
								+ cm.sourceId() );
			return true;
		}
		*/

		// See http://stackoverflow.com/a/8713321
		// For Android 3.0+
		public void openFileChooser(ValueCallback<Uri> fileInputCb, String acceptType)
		{
			Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
			intent.addCategory(Intent.CATEGORY_OPENABLE);
			//intent.setType(acceptType);
			intent.setType("text/plain");
			ShockTherapyActivity.this.webviewFileInputCb = fileInputCb;
			ShockTherapyActivity.this.startActivityForResult(
				Intent.createChooser(intent, "File Chooser"),
				ShockTherapyActivity.WEBVIEW_FILE_INPUT_RESULTCODE);
		}

		// For Android < 3.0
		public void openFileChooser( ValueCallback<Uri> uploadMsg )
		{
			openFileChooser(uploadMsg, "*/*");
		}
	}

	private class JavaScriptInterface {

		JavaScriptInterface() {
		}

		@SuppressWarnings("unused")
		public void viewChanged(String url) {
			ShockTherapyActivity.this.url = url;
		}

		@SuppressWarnings("unused")
		public void startSoundLoop(String name, float volume) {
			MediaPlayer mediaPlayer =
				ShockTherapyActivity.this.getMediaPlayer();
			if (mediaPlayer != null)
			{
				mediaPlayer.setVolume(volume, volume);
				mediaPlayer.start();
			}
		}

		@SuppressWarnings("unused")
		public void stopSoundLoop(String name) {
			if (mediaPlayer != null)
			{
				mediaPlayer.pause();
				mediaPlayer.seekTo(0);
			}
		}

		@SuppressWarnings("unused")
		public void startVibrator(float intensity) {
			Vibrator vibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);

			if (intensity > 0f)
			{
				long[] pattern = new long[2];
				if (intensity >= 0.99)
				{
					pattern[0] = 0;
					pattern[1] = 10;
				}
				else
				{
					float offset = 0.45f;
					float factor = offset + intensity * (1 - offset);
					pattern[0] = (long)(10 / factor);
					pattern[1] = (long)(10 * factor);
				}
				vibrator.vibrate(pattern, 0);
			}
		}

		@SuppressWarnings("unused")
		public void stopVibrator() {
			Vibrator vibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
			vibrator.cancel();
		}

		public String getItem(String key) {
			return getPreferences(MODE_PRIVATE).getString(key, null);
		}

		@SuppressWarnings("unused")
		public void setItem(String key, String value) {
			SharedPreferences.Editor editor = getPreferences(MODE_PRIVATE).edit();
			editor.putString(key, value);
			editor.apply();
		}

		@SuppressWarnings("unused")
		public void remove(String key) {
			SharedPreferences.Editor editor = getPreferences(MODE_PRIVATE).edit();
			editor.remove(key);
			editor.apply();
		}

		@SuppressWarnings("unused")
		public void getTextFile(String mimeType, String encoding, String prompt) {
			webviewFileInputRequest = new HashMap<String,String>();
			webviewFileInputRequest.put("mimeType", mimeType);
			webviewFileInputRequest.put("encoding", encoding);
			webviewFileInputRequest.put("prompt", prompt);

			Intent intent = new Intent(FileManagerIntents.ACTION_PICK_FILE);

			// setup starting directory
			String fileName = getItem(FILE_CHOOSER_LOC);
			if (fileName == null)
				fileName = DEFAULT_EXPORT_FILE_NAME;
			intent.setData(Uri.fromFile(new File(fileName)));

			//intent.putExtra(FileManagerIntents.EXTRA_TITLE, getString(R.string.save_title));
			//intent.putExtra(FileManagerIntents.EXTRA_BUTTON_TEXT, getString(R.string.save_button));

			try {
				startActivityForResult(intent, WEBVIEW_FILE_INPUT_JS_OI_RESULTCODE);
			} catch (ActivityNotFoundException e) {
				intent = new Intent(Intent.ACTION_GET_CONTENT);
				intent.setType("text/plain");
				//i.setType("*/*");
				intent.addCategory(Intent.CATEGORY_OPENABLE);
				ShockTherapyActivity.this.startActivityForResult(
					Intent.createChooser(intent, "File Chooser"),
					ShockTherapyActivity.WEBVIEW_FILE_INPUT_JS_RESULTCODE);
			}
		}
	}
}
