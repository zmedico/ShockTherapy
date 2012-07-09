
import base64
import logging
import os
import tempfile

try:
	from urllib.parse import unquote
except ImportError:
	from urllib import unquote

from gettext import gettext as _

from sugar import mime
from sugar.activity import activity
from sugar.datastore import datastore
from sugar.graphics.alert import Alert
from sugar.graphics.icon import Icon
from sugar.graphics.toolbarbox import ToolbarBox
from sugar.graphics.toolbutton import ToolButton
from sugar.graphics.objectchooser import ObjectChooser
from sugar.activity.widgets import StopButton

import gtk
import webkit

from WebKitWebInspectorManager import WebKitWebInspectorManager

class ShockTherapyActivity(activity.Activity):

	_MAIN_URL = "layout/main.html"
	_SCREENSAVER_URL = "layout/main.html#screensaver"
	_OPTIONS_URL = "layout/main.html#options"
	_ABOUT_URL = "layout/main.html#about"

	_URI_WHITELIST = (
		"http://electroshocktherapy.googlecode.com/",
		"https://electroshocktherapy.googlecode.com/",
		"http://wiki.electroshocktherapy.googlecode.com/",
		"https://wiki.electroshocktherapy.googlecode.com/",
		"http://code.google.com/p/electroshocktherapy/",
		"https://code.google.com/p/electroshocktherapy/"
	)

	def __init__(self, handle):
		activity.Activity.__init__(self, handle)
		#logging.getLogger().setLevel(logging.DEBUG)

		self._http_dir = activity.get_bundle_path() + '/web/'
		self._base_uri = "file://" + self._http_dir

		# toolbar with the new toolbar redesign
		toolbar_box = ToolbarBox()

		self._back = ToolButton('go-previous')
		self._back.set_tooltip(_('Back'))
		self._back.connect('clicked', self._go_back_cb)
		toolbar_box.toolbar.insert(self._back, -1)

		separator = gtk.SeparatorToolItem()
		separator.props.draw = False
		separator.set_expand(True)
		toolbar_box.toolbar.insert(separator, -1)

		self._main_button = ToolButton()
		self._main_button.set_tooltip(_('Main'))
		self._main_button.set_icon_widget(
			Icon(file=os.path.join(activity.get_bundle_path(),
			'activity', 'high-voltage-warning.svg')))
		self._main_button.connect('clicked', self._main_cb)
		toolbar_box.toolbar.insert(self._main_button, -1)

		self._screensaver_button = ToolButton('player_play')
		self._screensaver_button.set_tooltip(_('Screen Saver'))
		self._screensaver_button.connect('clicked', self._screensaver_cb)
		toolbar_box.toolbar.insert(self._screensaver_button, -1)

		self._options_button = ToolButton('preferences-system')
		self._options_button.set_tooltip(_('Options'))
		self._options_button.connect('clicked', self._options_cb)
		toolbar_box.toolbar.insert(self._options_button, -1)

		self._about_button = ToolButton('emblem-question')
		self._about_button.set_tooltip(_('About'))
		self._about_button.connect('clicked', self._about_cb)
		toolbar_box.toolbar.insert(self._about_button, -1)

		separator = gtk.SeparatorToolItem()
		separator.props.draw = False
		separator.set_expand(True)
		toolbar_box.toolbar.insert(separator, -1)

		reload_button = ToolButton('view-refresh')
		reload_button.set_tooltip(_('Refresh'))
		reload_button.connect('clicked', self._reload_cb)
		toolbar_box.toolbar.insert(reload_button, -1)

		dev_tools_button = ToolButton('view-source')
		dev_tools_button.set_tooltip(_('Developer Tools'))
		toolbar_box.toolbar.insert(dev_tools_button, -1)

		separator = gtk.SeparatorToolItem()
		separator.props.draw = False
		separator.set_expand(True)
		toolbar_box.toolbar.insert(separator, -1)

		fullscreen_button = ToolButton('view-fullscreen')
		fullscreen_button.set_tooltip(_('Fullscreen'))
		fullscreen_button.connect('clicked', self._fullscreen_cb)
		toolbar_box.toolbar.insert(fullscreen_button, -1)

		zoom_in_button = ToolButton('zoom-in')
		zoom_in_button.set_tooltip(_('Zoom In'))
		zoom_in_button.connect('clicked', self._zoom_in_cb)
		toolbar_box.toolbar.insert(zoom_in_button, -1)

		zoom_out_button = ToolButton('zoom-out')
		zoom_out_button.set_tooltip(_('Zoom Out'))
		zoom_out_button.connect('clicked', self._zoom_out_cb)
		toolbar_box.toolbar.insert(zoom_out_button, -1)


		zoom_default_button = ToolButton('zoom-original')
		zoom_default_button.set_tooltip(_('Zoom Default'))
		zoom_default_button.connect('clicked', self._zoom_default_cb)
		toolbar_box.toolbar.insert(zoom_default_button, -1)

		separator = gtk.SeparatorToolItem()
		separator.props.draw = False
		separator.set_expand(True)
		toolbar_box.toolbar.insert(separator, -1)

		stop_button = StopButton(self)
		toolbar_box.toolbar.insert(stop_button, -1)

		self.set_toolbar_box(toolbar_box)

		self._webview = webkit.WebView()
		settings = self._webview.get_settings()
		settings.set_property('user-agent', settings.get_property('user-agent') +
			" sugar:com.googlecode.electroshocktherapy")
		self._title_req_ids = set()
		self._webview.connect_after('notify::title', self._dom_title_cb)
		self._webview.connect('navigation-policy-decision-requested',
			self._navigate_cb)
		self._webview.connect('notify::uri', self._webview_uri_cb)
		self._scrolled_window = gtk.ScrolledWindow()
		self._scrolled_window.props.hscrollbar_policy = gtk.POLICY_AUTOMATIC
		self._scrolled_window.props.vscrollbar_policy = gtk.POLICY_AUTOMATIC
		self._scrolled_window.add(self._webview)

		self._vpaned = gtk.VPaned()
		self.set_canvas(self._vpaned)
		self._vpaned.add1(self._scrolled_window)

		self.show_all()
		self._inspector_manager = WebKitWebInspectorManager(
			self._webview, self._vpaned)
		dev_tools_button.connect('clicked', self._inspector_manager.toggle)

		self._urls = {}
		self._urls["MAIN"] = self._base_uri + self._MAIN_URL
		self._urls["SCREENSAVER"] = self._base_uri + self._SCREENSAVER_URL
		self._urls["OPTIONS"] = self._base_uri + self._OPTIONS_URL
		self._urls["ABOUT"] = self._base_uri + self._ABOUT_URL

		self._url_button_map = {}
		self._url_button_map[self._urls["MAIN"]] = self._main_button
		self._url_button_map[self._urls["SCREENSAVER"]] = self._screensaver_button
		self._url_button_map[self._urls["OPTIONS"]] = self._options_button
		self._url_button_map[self._urls["ABOUT"]] = self._about_button

		# Initialize button state without delay, so it's in the desired
		# initial state even before the first page finishes loading.
		self._uri_cb(self._urls["MAIN"])
		self._webview.load_uri(self._urls["MAIN"])

	def _navigate_cb(self, view, frame, request, nav_action, policy_decision):
		uri = request.get_uri()
		logging.debug("_navigate_cb: %s" % (uri,))
		if uri.startswith("about:"):
			return False
		elif uri.startswith(self._base_uri) or \
			uri.rstrip("/") == self._base_uri.rstrip("/"):
			return False
		for allowed_uri in self._URI_WHITELIST:
			if uri.startswith(allowed_uri) or \
				uri.rstrip("/") == allowed_uri.rstrip("/"):
				return False
		logging.debug("_navigate_cb reject: %s" % (uri,))
		return True

	def _dom_title_cb(self, view, gParamSpec):
		"""
		Use the document.title notify::title property change signal to call
		Python from JavaScript, as suggested here:
		http://code.google.com/p/pywebkitgtk/wiki/HowDoI
		"""
		title = self._webview.get_main_frame().get_title()
		#logging.debug("_dom_title_cb: %s" % (title,))
		if title is None:
			self._title_req_ids.clear()
		else:
			if title.startswith("ShockTherapySugarRequest:"):
				parts = title.split(":", 2)
				if len(parts) != 3:
					raise ValueError(title)
				callback = parts[1]
				path = parts[2]
				req_id = int(callback[len("shockTherapySugarRequest"):])
				if req_id in self._title_req_ids:
					# suppress event with duplicate req_id
					pass
				else:
					self._title_req_ids.add(req_id)

					if path.startswith("file:///ShockTherapy."):
						command = path[len("file:///ShockTherapy."):]
						status = 200
						content = b''
						if command.startswith("viewChanged:"):
							uri = unquote(command[len("viewChanged:"):])
							self._uri_cb(uri)

					elif path.startswith("file:///ShockTherapyConfig."):
						command = path[len("file:///ShockTherapyConfig."):]
						status = 200
						content = b''
						if command == "load":
							content = self.metadata.get("options")
							if content is None:
								content = b"{}"
							else:
								content = content.decode(
									encoding="utf_8", errors="replace")
						elif command.startswith("persist:"):
							self.metadata['options'] = unquote(command[len("persist:"):])
						elif command.startswith("export:"):
							options = unquote(command[len("export:"):])
							self.metadata['options'] = options
							options.encode(encoding='utf_8', errors='replace')
							dsobject = self._save_dsobject(
								"ShockTherapyOptions.json", options)
							self._saved_dsobject_alert(dsobject)
						elif command == "import":
							chooser = ObjectChooser(parent=self,
								what_filter=mime.GENERIC_TYPE_TEXT)
							result = chooser.run()
							if result == gtk.RESPONSE_ACCEPT:
								f = open(chooser.get_selected_object().get_file_path(), 'rb')
								try:
									options = f.read()
								finally:
									f.close()
								options = options.decode(
									encoding='utf_8', errors='replace')
								self.metadata['options'] = options
								self._webview.reload()

					else:
						path = path[len(self._base_uri):]
						path = os.path.join(self._http_dir, path)
						path = os.path.normpath(path)
						if not (path.startswith(self._http_dir)):
							# don't allow traversal above _http_dir via ../
							status = 404
							content = ""
						else:
							f = None
							try:
								f = open(path, 'rb')
								content = f.read()
							except IOError:
								status = 404
								content = ""
							else:
								status = 200
							finally:
								if f is not None:
									f.close()

					#logging.debug(
					#	"ShockTherapySugarRequest: %s status: %s content: %s" %
					#	(path, status, content))
					self._webview.execute_script("%s(%s, \"%s\")" %
						(callback, status, base64.b64encode(content)))

	def _save_dsobject(self, filename, content,
		mime_type=None, description=None):
		parent_dir = os.path.join(self.get_activity_root(), 'tmp')
		try:
			os.makedirs(parent_dir)
		except OSError:
			pass
		fd, tmp_filename = tempfile.mkstemp(dir=parent_dir,
			suffix=filename, prefix='tmp')
		try:
			os.write(fd, content)
		except:
			raise
		else:
			dsobject = datastore.create()
			dsobject.metadata['title'] = filename
			if mime_type is None:
				mime_type = mime.get_for_file(tmp_filename)
			dsobject.metadata['mime_type'] = mime_type
			if description is None:
				description = _('From: %s')  % (self.metadata['title'],)
			dsobject.metadata['description'] = description
			dsobject.set_file_path(tmp_filename)
			datastore.write(dsobject)
		finally:
			os.close(fd)
			os.unlink(tmp_filename)

		return dsobject

	def _saved_dsobject_alert(self, dsobject):
		saved_alert = Alert()
		saved_alert.props.title = _('Download completed')
		saved_alert.props.msg = dsobject.metadata['title']
		saved_alert.add_button(gtk.RESPONSE_APPLY,
			_('Show in Journal'), Icon(icon_name='zoom-activity'))
		saved_alert.add_button(gtk.RESPONSE_OK, _('Ok'),
			Icon(icon_name='dialog-ok'))

		def response_cb(alert, response_id):
			if response_id is gtk.RESPONSE_APPLY:
				activity.show_object_in_journal(dsobject.object_id)
			self.remove_alert(alert)

		saved_alert.connect('response', response_cb)
		self.add_alert(saved_alert)
		saved_alert.show_all()

	def _webview_uri_cb(self, view, gParamSpec):
		self._uri_cb(view.get_property("uri"))

	def _uri_cb(self, uri):

		self._back.props.sensitive = self._webview.can_go_back()
		self._main_button.set_sensitive(True)
		self._screensaver_button.set_sensitive(True)
		self._options_button.set_sensitive(True)
		self._about_button.set_sensitive(True)

		uri = uri.rstrip("#")
		disabled_button = self._url_button_map.get(uri)
		if disabled_button is not None:
			disabled_button.set_sensitive(False)

	@staticmethod
	def _strip_fragment(uri):
		index = uri.find("#")
		if index != -1:
			uri = uri[:index]
		return uri

	def _load_uri(self, uri):
		previous = self._webview.get_property("uri")
		if self._strip_fragment(uri) == self._strip_fragment(previous):
			# avoid page reload
			index = uri.find("#")
			if index == -1:
				location_hash = ""
			else:
				location_hash = uri[index:]
			self._webview.execute_script(
				"window.location.hash='%s'" % location_hash)
		else:
			self._webview.load_uri(uri)

	def _go_back_cb(self, button):
		if self._webview.get_property("uri").startswith(self._urls["MAIN"]):
			# avoid page reload
			self._webview.execute_script("ShockTherapy.goBack()")
		else:
			self._webview.go_back()

	def _main_cb(self, button):
		self._load_uri(self._urls["MAIN"])

	def _screensaver_cb(self, button):
		self._load_uri(self._urls["SCREENSAVER"])

	def _options_cb(self, button):
		self._load_uri(self._urls["OPTIONS"])

	def _about_cb(self, button):
		self._load_uri(self._urls["ABOUT"])

	def _reload_cb(self, button):
		self._webview.reload()

	def _fullscreen_cb(self, button):
		self.fullscreen()

	def _zoom_in_cb(self, button):
		self._webview.zoom_in()

	def _zoom_out_cb(self, button):
		self._webview.zoom_out()

	def _zoom_default_cb(self, button):
		if self._webview.get_zoom_level() != 1.0:
			self._webview.set_zoom_level(1.0)
