import java.io.IOException;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class XmlHelper {
	public static DocumentBuilder newDocumentBuilder()
		throws ParserConfigurationException {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		DocumentBuilder db = dbf.newDocumentBuilder();
		/* Avoid extremely poor performance:
		 * http://stackoverflow.com/questions/155101/make-documentbuilder-parse-ignore-dtd-references
		 */
		db.setEntityResolver(new EntityResolver() {
			@Override
			public InputSource resolveEntity(String publicId, String systemId)
				throws SAXException, IOException {
				return new InputSource(new StringReader(""));
			}
		});
		return db;
	}
}
