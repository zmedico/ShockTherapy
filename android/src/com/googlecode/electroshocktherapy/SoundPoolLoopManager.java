package com.googlecode.electroshocktherapy;

import java.util.HashMap;

import android.content.Context;
import android.media.AudioManager;
import android.media.SoundPool;
import android.util.SparseArray;

public class SoundPoolLoopManager {

	private SoundPool soundPool;
	private float volume;
	private Context context;
	private int resId;
	private Integer soundID;
	private Integer streamID;
	private boolean paused;

	public SoundPoolLoopManager(Context context, int resId) {
		this.context = context;
		this.resId = resId;
	}

	private SoundPool getSoundPool() {
		if (soundPool == null)
		{
			soundPool = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
			soundPool.setOnLoadCompleteListener(new SPListener());
		}
		return soundPool;
	}

	public void release() {
		if (soundPool != null) {
			soundPool.release();
			soundPool = null;
			soundID = null;
			streamID = null;
		}
	}

	public void pause() {
		paused = true;
		if (soundPool != null && streamID != null)
			soundPool.pause(streamID);
	}

	public void setVolume(float volume) {
		this.volume = volume;
	}

	public void play() {
		SoundPool soundPool = getSoundPool();
		if (soundPool != null)
		{

			paused = false;

			if (soundID == null)
				soundID = soundPool.load(this.context, resId, 1);

			if (streamID != null) {
				soundPool.setVolume(streamID, this.volume, this.volume);
				soundPool.resume(streamID);
			}
		}
	}

	private class SPListener implements SoundPool.OnLoadCompleteListener {
		@Override
		public void onLoadComplete(SoundPool soundPool,
			int sampleId, int status) {
			if (status == 0) {
				streamID = soundPool.play(sampleId,
						SoundPoolLoopManager.this.volume,
						SoundPoolLoopManager.this.volume, 1, -1, 1f);
				if (streamID == 0)
					System.err.println("soundPool.play failed");
				else {
					if (paused) {
						/* A pause request came in before it finished
						loading, so pause it now. */
						soundPool.pause(streamID);
					}
				}
			}
			else {
				System.err.println("soundPool.load failed");
			}
		}
	}
}
