import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;

public class RepeatAudioLoop {

	public static void main(String[] args) throws IOException, UnsupportedAudioFileException {

		int repeatCount = Integer.parseInt(args[0]);
		String inputPath = args[1];
		String outputPath = args[2];

		AudioFileFormat inFileFormat;
		File inFile = new File(inputPath);
		inFileFormat = AudioSystem.getAudioFileFormat(inFile);
		AudioFormat format = inFileFormat.getFormat();

		int channels = format.getChannels();
		int sampleBytes = format.getSampleSizeInBits() / 8;
		int nFrames = inFileFormat.getFrameLength();
		int nSamples = nFrames * channels;
		int nBytes = nSamples * sampleBytes;
		ByteBuffer data = ByteBuffer.allocate(nBytes);
		byte[] buf = new byte[format.getFrameSize()];

		AudioInputStream inStream = AudioSystem.getAudioInputStream(inFile);
		int count;
		while ((count = inStream.read(buf)) != -1)
			data.put(buf, 0, count);
		inStream.close();

		ByteBuffer outputData;
		int outputFrames;
		if (repeatCount == 1) {
			outputFrames = nFrames;
			outputData = data;
		}
		else {
			outputFrames = nFrames * repeatCount;
			outputData = ByteBuffer.allocate(nBytes * repeatCount);
			byte[] inputArray = data.array();
			for (int i = 0; i < repeatCount; i++) {
				outputData.put(inputArray);
			}
		}

		AudioInputStream stream = new AudioInputStream(
			new ByteArrayInputStream(outputData.array()),
			format, outputFrames);

		AudioSystem.write(stream, AudioFileFormat.Type.WAVE,
			new File(outputPath));
	}

}
