
import logging

import gtk
import webkit

class WebKitWebInspectorManager(object):
	def __init__(self, webview, vpaned):
		self._webview = webview
		self._vpaned = vpaned
		settings = self._webview.get_settings()
		settings.set_property("enable-developer-extras", True)
		self._inspect_menuitem = None
		self._popdown_next_menu = False
		self._webview.connect_after("populate-popup", self._populate_popup_cb)
		self._ignore_next_show = False
		self._inspector_scrolled_window = None
		self._inspector_web_view = None
		self._webview.get_web_inspector().connect("inspect-web-view",
			self._inspect_web_view_cb)
		self._webview.get_web_inspector().connect("close-window",
			self._inspect_close_cb)
		self._webview.get_web_inspector().connect("show-window",
			self._inspect_show_cb)
		self._init()

	def _init(self):
		if self._inspect_menuitem is None:
			self._popdown_next_menu = True
			self._ignore_next_show = True
			self._webview.emit("popup-menu")
			if self._inspect_menuitem is not None:
				self._inspect_menuitem.activate()
			else:
				logging.error("WebKitWebInspectorManager._init(): " +
					"inspect MenuItem not found")

	def hide(self):
		self._vpaned.remove(self._inspector_scrolled_window)

	def show(self):
		self._vpaned.add2(self._inspector_scrolled_window)
		self._vpaned.set_position(self._vpaned.get_allocation().height / 2)

	def toggle(self, button):
		if self._is_inspector_visible():
			self.hide()
		else:
			self.show()

	def _populate_popup_cb(self, view, menu):
		# Grab the "inspect element" menu item. Testing shows that
		# there can be new a menu item generated for each popup, and
		# only the one that was most recently generated appears to
		# work.
		for item in menu.get_children():
			if "inspect" in item.props.label.lower():
				self._inspect_menuitem = item
				break
		if self._popdown_next_menu:
			self._popdown_next_menu = False
			handler_id = None
			def hide(menu, evt):
				menu.disconnect(handler_id)
				menu.popdown()
			handler_id = menu.connect("expose-event", hide)

		logging.debug("_populate_popup_cb: " + repr(self._inspect_menuitem));
		return False

	def _inspect_web_view_cb(self, inspector, web_view):
		logging.debug("_inspect_web_view_cb")

		if self._inspector_scrolled_window is None:
			self._inspector_scrolled_window = gtk.ScrolledWindow()
			self._inspector_scrolled_window.props.hscrollbar_policy = gtk.POLICY_AUTOMATIC
			self._inspector_scrolled_window.props.vscrollbar_policy = gtk.POLICY_AUTOMATIC
			self._inspector_web_view = webkit.WebView()
			self._inspector_scrolled_window.add(self._inspector_web_view)
			self._inspector_scrolled_window.show_all()

		return self._inspector_web_view

	def _inspect_show_cb(self, inspector):
		logging.debug("_inspect_show_cb")
		if self._ignore_next_show:
			self._ignore_next_show = False
		else:
			self.show()
		return True

	def _inspect_close_cb(self, inspector):
		logging.debug("_inspect_close_cb")
		self.hide()
		return True

	def _is_inspector_visible(self):
		return self._vpaned.get_child2() is not None
