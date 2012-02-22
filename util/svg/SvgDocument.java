import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.ListIterator;
import java.util.regex.Pattern;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public  class SvgDocument {
	/*
	* This implements minimal/incomplete SVG rendering support on top
	* of the Java 2D API. It's just enough to render some really simple
	* icons.
	*/
	private double width;
	private double height;
	private LinkedList<SvgNode> nodes;
	@SuppressWarnings("serial")
	public static class SvgDocumentError extends Exception{
		public SvgDocumentError(String msg) {
			super(msg);
		}
	}
	public SvgDocument(Document doc) throws SvgDocumentError {
		Element svgElement = (Element)doc.getElementsByTagName("svg").item(0);
		if (svgElement == null)
			throw new SvgDocumentError("svg tag not found");
		_parse(svgElement);
	}
	private void _parse(Element svgElement) throws SvgDocumentError {
		width = Double.parseDouble(svgElement.getAttribute("width"));
		height = Double.parseDouble(svgElement.getAttribute("height"));
		nodes = new LinkedList<SvgNode>();
		NodeList domNodes = svgElement.getChildNodes();
		Node node = null;
		for (int i = 0; i < domNodes.getLength(); i++) {
			node = domNodes.item(i);
			if (node.getNodeType() == Node.ELEMENT_NODE
				&& ((Element) node).getTagName().equalsIgnoreCase("path"))
				nodes.add(new SvgNode((Element) node));
		}
	}
	public double getWidth() {
		return width;
	}
	public double getHeight() {
		return height;
	}
	public LinkedList<SvgNode> getNodes() {
		return nodes;
	}
	public BufferedImage render(BufferedImage image) {
		Graphics2D g2 = (Graphics2D)image.getGraphics();
		RenderingHints rh = new RenderingHints(null);
		rh.put(RenderingHints.KEY_ANTIALIASING,
			RenderingHints.VALUE_ANTIALIAS_ON);
		g2.setRenderingHints(rh);
		AffineTransform backupTranform = g2.getTransform();
		AffineTransform t = g2.getTransform();
		double docAspectRatio = width / height;
		double imageAspectRatio = image.getWidth() / (double) image.getHeight();
		double scale;
		if (imageAspectRatio > docAspectRatio)
			scale = image.getHeight() / height;
		else
			scale = image.getWidth() / width;
		t.concatenate(AffineTransform.getTranslateInstance(
			0, (image.getHeight() - height * scale)/2.0));
		t.concatenate(AffineTransform.getScaleInstance(scale, scale));
		g2.setTransform(t);
		ListIterator<SvgDocument.SvgNode> listIterator = nodes.listIterator();
		while (listIterator.hasNext())
			listIterator.next().draw(g2);
		g2.setTransform(backupTranform);

		return image;
	}
	private static class SvgNode {
		private static final Pattern colorPattern =
			Pattern.compile("#[0-9a-fA-f]{6}+");
		private GeneralPath path;
		private HashMap<String,String> style;
		private Color strokeColor;
		private Color fillColor;
		private BasicStroke stroke = null;
		public SvgNode(Element element) throws SvgDocumentError {
			path = new GeneralPath();
			parsePath(path, element.getAttribute("d"));
			style = parseStyle(element.getAttribute("style"));
			if (style.containsKey("fill-rule") &&
				style.get("fill-rule").equalsIgnoreCase("evenodd"))
				path.setWindingRule(GeneralPath.WIND_EVEN_ODD);
			fillColor = Color.black;
			if (style.containsKey("fill"))
				fillColor = parseColor(style.get("fill"));
			strokeColor = Color.black;
			if (style.containsKey("stroke"))
				strokeColor = parseColor(style.get("stroke"));

			if (style.containsKey("stroke") ||
				style.containsKey("stroke-width") ||
				style.containsKey("stroke-linejoin")) {
				float strokeWidth = 1f;
				if (style.containsKey("stroke-width"))
					try {
						strokeWidth = Float.parseFloat(
							style.get("stroke-width"));
					}
					catch (NumberFormatException e) {
						throw new SvgDocumentError(
							"unrecognized stroke-width: "
							+ style.get("stroke-width"));
					}

				String value;
				int strokeLinecap = BasicStroke.CAP_BUTT;
				if (style.containsKey("stroke-linecap")) {
					value = style.get("stroke-linecap");
					if (value.equalsIgnoreCase("round"))
						strokeLinecap = BasicStroke.CAP_ROUND;
					else if (value.equalsIgnoreCase("square"))
						strokeLinecap = BasicStroke.CAP_SQUARE;
					else if (!value.equalsIgnoreCase("butt"))
						throw new SvgDocumentError(
							"unrecognized stroke-linecap: "
							+ style.get("stroke-linecap"));
				}

				int strokeLineJoin = BasicStroke.JOIN_MITER;
				if (style.containsKey("stroke-linejoin")) {
					value = style.get("stroke-linejoin");
					if (value.equalsIgnoreCase("round"))
						strokeLineJoin = BasicStroke.JOIN_ROUND;
					else if (value.equalsIgnoreCase("bevel"))
						strokeLineJoin = BasicStroke.JOIN_BEVEL;
					else if (!value.equalsIgnoreCase("miter"))
						throw new SvgDocumentError(
							"unrecognized stroke-linejoin: "
							+ style.get("stroke-linejoin"));
				}

				stroke = new BasicStroke(strokeWidth, strokeLinecap,
					strokeLineJoin);
			}
		}
		private static void parsePath(GeneralPath p, String d)
			throws SvgDocumentError{
			String[] s = d.split("[\\s,]");
			int i = 0;
			double x = 0;
			double y = 0;
			double prevX = 0;
			double prevY = 0;
			String cmd = null;
			String prev_cmd = null;
			try {
				while (i < s.length) {
					prev_cmd = cmd;
					cmd = s[i++];
					if (prev_cmd != null) {
						try {
							Double.parseDouble(cmd);
							if (Character.isLowerCase(prev_cmd.charAt(0)))
								cmd = "l";
							else
								cmd = "L";
							i--;
						}
						catch (NumberFormatException e) {
						}
					}

					if (cmd.equalsIgnoreCase("M")) {
						x = Double.parseDouble(s[i++]);
						y = Double.parseDouble(s[i++]);
						if (Character.isLowerCase(cmd.charAt(0))) {
							x += prevX;
							y += prevY;
						}
						p.moveTo(x, y);
					}
					else if (cmd.equalsIgnoreCase("L")) {
						x = Double.parseDouble(s[i++]);
						y = Double.parseDouble(s[i++]);
						if (Character.isLowerCase(cmd.charAt(0))) {
							x += prevX;
							y += prevY;
						}
						p.lineTo(x, y);
					}
					else if (cmd.equalsIgnoreCase("C")) {
						double x1 = Double.parseDouble(s[i++]);
						double y1 =  Double.parseDouble(s[i++]);
						double x2 = Double.parseDouble(s[i++]);
						double y2 =  Double.parseDouble(s[i++]);
						x = Double.parseDouble(s[i++]);
						y =  Double.parseDouble(s[i++]);
						if (Character.isLowerCase(cmd.charAt(0))) {
							x1 += prevX;
							y1 += prevY;
							x2 += prevX;
							y2 += prevY;
							x += prevX;
							y += prevY;
						}
						p.curveTo(x1, y1, x2, y2, x, y);
					}
					else if (cmd.equalsIgnoreCase("Z"))
						p.closePath();
					else throw new SvgDocumentError(
						"path contains unrecognized command: " + cmd);

					prevX = x;
					prevY = y;
				}
			}
			catch (NumberFormatException e) {
				throw new SvgDocumentError(
					"path contains invalid number: " + e.getMessage());
			}
		}
		private static HashMap<String,String> parseStyle(String style) throws SvgDocumentError{
			HashMap<String,String> map = new HashMap<String,String>();
			String[] s = style.split("[\\s;]");
			for (int i = 0; i < s.length; i++) {
				String[] item = s[i].split("[\\s:]");
				if (item.length != 2)
					throw new SvgDocumentError(
						"unrecognized style:" + s[i]);
				map.put(item[0], item[1]);
			}
			return map;
		}
		private static Color parseColor(String value)
			throws SvgDocumentError {
			if (!colorPattern.matcher(value).matches())
				throw new SvgDocumentError(
					"unrecognized color value: " + value);
			int r = Integer.parseInt(value.substring(1, 3), 16);
			int g = Integer.parseInt(value.substring(3, 5), 16);
			int b = Integer.parseInt(value.substring(5, 7), 16);
			return new Color(r, g, b);
		}
		public void draw(Graphics2D g2) {
			if (style.containsKey("fill") ||
				style.containsKey("fill-rule")) {
				g2.setColor(fillColor);
				g2.fill(path);
			}
			if (stroke != null) {
				g2.setStroke(stroke);
				g2.setColor(strokeColor);
				g2.draw(path);
			}
		}
	}
}
