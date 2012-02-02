
import errno
import logging
import io
import os
import socket
import tempfile
import threading
import time

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
from HttpServer import RequestResult, ThreadedHttpServer

class ShockTherapyActivity(activity.Activity):

	_MAIN_URL = "layout/main.html"
	_OPTIONS_URL = "layout/options.html"
	_ABOUT_URL = "layout/about.html"

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

		self.__options = self.metadata.get("options")
		logging.debug("ShockTherapyActivity.__init__ options: %s" %
			(self.__options,))
		self.__options_lock = threading.RLock()

		http_dir = activity.get_bundle_path() + '/web'
		host = "localhost"
		port = 30000
		max_port = 31000
		listeners = (self._req_listener,)
		while True:
			try:
				self._server = ThreadedHttpServer((host, port), http_dir,
					listeners=listeners)
			except socket.error as e:
				if e.errno != errno.EADDRINUSE:
					raise
				if port >= max_port:
					raise
				port += 1
			else:
				break

		self._server_thread = threading.Thread(
			target=self._server.serve_forever)
		self._server_thread.setDaemon(True)
		self._server_thread.start()

		self._base_uri = 'http://localhost:%s/' % (port,)

		# toolbar with the new toolbar redesign
		toolbar_box = ToolbarBox()

		self._back = ToolButton('go-previous-paired')
		self._back.set_tooltip(_('Back'))
		self._back.connect('clicked', self._go_back_cb)
		toolbar_box.toolbar.insert(self._back, -1)

		self._forward = ToolButton('go-next-paired')
		self._forward.set_tooltip(_('Forward'))
		self._forward.connect('clicked', self._go_forward_cb)
		toolbar_box.toolbar.insert(self._forward, -1)

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
		self._webview.connect('notify::uri', self._uri_cb)
		self._webview.connect('notify::title', self._dom_title_cb)
		self._webview.connect('navigation-policy-decision-requested',
			self._navigate_cb)
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
		self._urls["OPTIONS"] = self._base_uri + self._OPTIONS_URL
		self._urls["ABOUT"] = self._base_uri + self._ABOUT_URL

		self._url_button_map = {}
		self._url_button_map[self._urls["MAIN"]] = self._main_button
		self._url_button_map[self._urls["OPTIONS"]] = self._options_button
		self._url_button_map[self._urls["ABOUT"]] = self._about_button

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

	def __set_options(self, options):
		self.__options_lock.acquire()
		try:
			self.__options = options
		finally:
			self.__options_lock.release()

	def __get_options(self):
		"""
		Thread-safe accessor for the http server thread.
		"""
		self.__options_lock.acquire()
		try:
			return self.__options
		finally:
			self.__options_lock.release()

	def _dom_title_cb(self, view, gParamSpec):
		"""
		Use document.title to grab data, as described here:
		http://code.google.com/p/pywebkitgtk/wiki/HowDoI
		"""
		title = self._webview.get_main_frame().get_title()
		logging.debug("_dom_title_cb: %s" % (title,))
		if title is not None:
			if title.startswith("ShockTherapyConfig."):
				if title.startswith("ShockTherapyConfig.persist:"):
					command = "ShockTherapyConfig.persist:"
					logging.debug("_dom_title_cb command: %s" % (command,))
					self.__set_options(title[len(command):])
					self.metadata['options'] = self.__options
				elif title.startswith("ShockTherapyConfig.export:"):
					command = "ShockTherapyConfig.export:"
					logging.debug("_dom_title_cb command: %s" % (command,))
					options = title[len(command):]
					self.__set_options(options)
					dsobject = self._save_dsobject(
						"ShockTherapyOptions.json",
						options.encode(encoding='utf_8', errors='replace'))
					self._saved_dsobject_alert(dsobject)
				elif title.startswith("ShockTherapyConfig.import:"):
					command = "ShockTherapyConfig.import:"
					logging.debug("_dom_title_cb command: %s" % (command,))
					chooser = ObjectChooser(parent=self,
						what_filter=mime.GENERIC_TYPE_TEXT)
					result = chooser.run()
					if result == gtk.RESPONSE_ACCEPT:
						f = open(chooser.get_selected_object().get_file_path(), 'rb')
						try:
							options = f.read()
						finally:
							f.close()
						options = options.decode('utf_8')
						self.__set_options(options)
						self._webview.reload()

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

	def _req_listener(self, request):
		if request.path == '/data/options.json':
			options = self.__get_options()
			if options is None:
				request.send_error(404, "File not found")
				return RequestResult(True, None)
			options_bytes = options.encode('utf_8')
			ctype = request.guess_type(request.path)
			request.send_response(200)
			request.send_header("Content-type", ctype)
			request.send_header("Content-Length", len(options_bytes))
			request.send_header("Last-Modified",
				request.date_time_string(time.time()))
			request.end_headers()
			logging.debug("_req_listener: options.json")
			bytesio = io.BytesIO(options_bytes)
			return RequestResult(True, bytesio)

		return RequestResult(False, None)

	def can_close(self):
		logging.debug("can_close")

		if self._server is not None:
			self._server.shutdown()
			self._server.server_close()
			self._server_thread.join()
			self._server_thread = None
			self._server = None

		return True

	def _uri_cb(self, view, gParamSpec):
		self._back.props.sensitive = self._webview.can_go_back()
		self._forward.props.sensitive =  self._webview.can_go_forward()

		self._main_button.set_sensitive(True)
		self._options_button.set_sensitive(True)
		self._about_button.set_sensitive(True)

		disabled_button = self._url_button_map.get(view.get_property("uri"))
		if disabled_button is not None:
			disabled_button.set_sensitive(False)

	def _go_back_cb(self, button):
		self._webview.go_back()

	def _go_forward_cb(self, button):
		self._webview.go_forward()

	def _main_cb(self, button):
		self._webview.load_uri(self._urls["MAIN"])

	def _options_cb(self, button):
		self._webview.load_uri(self._urls["OPTIONS"])

	def _about_cb(self, button):
		self._webview.load_uri(self._urls["ABOUT"])

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
