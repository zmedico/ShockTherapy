package com.googlecode.electroshocktherapy;

import java.io.IOException;
import java.io.InputStream;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.util.Log;

public class AudioTrackLoopManager {

	private static final String TAG =
		"com.googlecode.electroshocktherapy.AudioTrackLoopManager";
	private static final int WAV_HEADER_SIZE = 44;
	private AudioTrack audioTrack;
	private float volume;
	private Context context;
	private int resId;
	private int loopEnd;

	public AudioTrackLoopManager(Context context, int resId) {
		this.context = context;
		this.resId = resId;
	}

	private AudioTrack getAudioTrack() {
		if (audioTrack == null)
		{
			try {
				AssetFileDescriptor afd =
					context.getResources().openRawResourceFd(resId);
				int dataLength = (int)afd.getDeclaredLength();
				InputStream in = afd.createInputStream();
				in.skip(WAV_HEADER_SIZE);
				dataLength -= WAV_HEADER_SIZE;
				loopEnd = dataLength / 2; // 2 bytes per sample (16BIT)
				audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC,
					44100, AudioFormat.CHANNEL_OUT_MONO,
					AudioFormat.ENCODING_PCM_16BIT, dataLength,
					AudioTrack.MODE_STATIC);
				byte[] buf = new byte[dataLength];
				int offset, count, written;
				offset = 0;
				while (offset < dataLength &&
					(count = in.read(buf, offset, dataLength - offset)) != -1)
					offset += count;
				written = audioTrack.write(buf, 0, dataLength);
				if (written != dataLength)
					Log.e(TAG, String.format("audioTrack.write() returned %d",
						written));
				in.close();
				afd.close();
			}
			catch (IOException e) {
				Log.e(TAG, "error reading resource", e);
				audioTrack = null;
			}
		}
		return audioTrack;
	}

	public void release() {
		if (audioTrack != null) {
			audioTrack.release();
			audioTrack = null;
		}
	}

	public void pause() {
		if (audioTrack != null) {
			audioTrack.stop();
		}
	}

	public void setVolume(float volume) {
		this.volume = volume;
	}

	public void play() {
		AudioTrack audioTrack = getAudioTrack();
		if (audioTrack != null)
		{
			audioTrack.reloadStaticData();
			audioTrack.setStereoVolume(volume, volume);
			audioTrack.setLoopPoints(0, loopEnd, -1);
			audioTrack.play();
		}
	}
}
