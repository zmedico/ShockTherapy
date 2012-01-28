import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import org.w3c.dom.Document;

public class CreateIcon {

	private final static Logger logger = Logger.getLogger(CreateIcon.class.getName());

	public static void main(String[] args) {
		//logger.setLevel(Level.INFO);
		logger.setLevel(Level.WARNING);
		String svgFile = args[0];
		String outputDir = args[1];
		String sizesArg = args[2];
		float blurScale = Float.parseFloat(args[3]);
		float blurSigma = Float.parseFloat(args[4]);
		String [] sizesArgSplit = sizesArg.split("[\\s]");
		int [] sizesInts = new int[sizesArgSplit.length];
		for (int i = 0; i < sizesInts.length; i++)
			sizesInts[i] = Integer.parseInt(sizesArgSplit[i]);
		Arrays.sort(sizesInts);
		int imageWidth = sizesInts[sizesInts.length-1];
		int imageHeight = sizesInts[sizesInts.length-1];

		logger.log(Level.INFO, "parsing xml");
		Document doc = null;
		SvgDocument svgDoc = null;
		try {
			doc = XmlHelper.newDocumentBuilder().parse(new File(svgFile));
			logger.log(Level.INFO, "validating svg content");
			svgDoc = new SvgDocument(doc);
		}
		catch (Exception e) {
			e.printStackTrace();
			logger.log(Level.SEVERE, "Fatal Error!");
			System.exit(1);
		}

		logger.log(Level.INFO, "rendering");
		BufferedImage masterImage = new BufferedImage(imageWidth,
			imageHeight, BufferedImage.TYPE_INT_ARGB);
		svgDoc.render(masterImage);

		for (int i = 0; i < sizesInts.length; i++) {

			int blurRadius = (int)Math.round(0.5 * imageWidth / sizesInts[i]);
			if (blurRadius < 1)
				blurRadius = 1;
			logger.log(Level.INFO, "smoothing " + sizesInts[i] + " " + blurRadius);
			/* Pad with blurRadius pixels just for the blur operation,
			 * and crop it off later, since otherwise ConvolveOp distorts
			 * edges.
			 */
			BufferedImage blurredImage = new BufferedImage(
				imageWidth + 2*blurRadius, imageHeight+2*blurRadius,
				BufferedImage.TYPE_INT_ARGB);
			Kernel kernel = new GaussianBlur(blurScale, blurSigma, blurRadius);
			ConvolveOp cop = new ConvolveOp(kernel,
				ConvolveOp.EDGE_NO_OP, null);
			BufferedImage masterBlurSource = new BufferedImage(
				imageWidth + 2*blurRadius, imageHeight+2*blurRadius,
				BufferedImage.TYPE_INT_ARGB);
			Graphics2D g2;
			g2 = (Graphics2D)masterBlurSource.getGraphics();
			g2.drawRenderedImage(masterImage,
				AffineTransform.getTranslateInstance(
				blurRadius, blurRadius));
			cop.filter(masterBlurSource, blurredImage);
			blurredImage = blurredImage.getSubimage(
					blurRadius, blurRadius, imageWidth, imageHeight);

			BufferedImage scaledImage = null;
			if (sizesInts[i] == imageWidth)
				scaledImage = blurredImage;
			else {
				scaledImage = new BufferedImage(
					sizesInts[i], sizesInts[i],
					BufferedImage.TYPE_INT_ARGB);
				g2 = (Graphics2D)scaledImage.getGraphics();
				g2.drawRenderedImage(blurredImage,
					AffineTransform.getScaleInstance(
					scaledImage.getWidth()/(double)imageWidth,
					scaledImage.getHeight()/(double)imageHeight));
			}

			String name = new File(svgFile).getName();
			name = name.substring(0, name.length() - 4) + "_";
			logger.log(Level.INFO, "writing");
			try {
				ImageIO.write(scaledImage, "png",
					new File(outputDir + "/" + name + sizesInts[i] + ".png"));
			}
			catch (IOException e) {
				e.printStackTrace();
				logger.log(Level.SEVERE, "Fatal Error!");
				System.exit(1);
			}
		}

		logger.log(Level.INFO, "done");
	}
}
