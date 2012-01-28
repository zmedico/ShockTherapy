import java.awt.image.Kernel;

public class GaussianBlur extends Kernel{
	/*
	* Create a Gaussian filter kernel of size 2 * r + 1.
	* The formula for a two dimensional Gaussian filter from
	* http://en.wikipedia.org/wiki/Gaussian_blur is:
	*
	*	g(x, y) = 1 / (2πσ²) * e ^ (-(x² + y²) / 2σ²)
	*
	* Add a scale variable for adjustment purposes,
	* normalize x and y by division with r, and add
	* an outer normalization coefficient which makes
	* the sum of all kernel values add up to 1.0:
	*
	*  kernel(x, y) = (1.0/sum) * e ^ (-((scale*(x-r))²/r² + (scale*(y-r))²/r²) / 2σ²)
	*
	* For a sigma value of 1.0, a scale value of 3.0 works
	* well, since the interesting range of a Gaussian function
	* with σ=1 is between 0 and 3.
	*/
	public GaussianBlur(float sigma, float scale, int r) {
		super(2 * r + 1, 2 * r + 1, createKernel(sigma, scale, r));
	}

	public static float[] createKernel(float sigma, float scale, int r) {
		int rows = 2 * r + 1;
		float[] kernel = new float[rows * rows];
		double twoSigmaSquared = 2 * sigma * sigma;
		double rSquared = r * r;
		double scaleSquared = scale * scale;
		double sum = 0.0;
		int x, xSquared, y, ySquared;
		int i = 0;
		for (y = 0; y < rows; y++) {
			ySquared = (y - r) * (y - r);
			for (x = 0; x < rows; x++) {
				xSquared = (x - r) * (x - r);
				kernel[i] = (float) Math.exp(-1 *
					(scaleSquared*xSquared/rSquared + scaleSquared*ySquared/rSquared)
					/ twoSigmaSquared);
				sum += kernel[i];
				i++;
			}
		}

		for (i = 0; i < kernel.length; i++)
			kernel[i] /= sum;

		return kernel;
	}
}
