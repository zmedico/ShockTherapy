#!/usr/bin/env python

import os

try:
	from urllib.parse import unquote, urlparse
except ImportError:
	from urlparse import urlparse
	from urllib import unquote

try:
	from http.server import SimpleHTTPRequestHandler
except ImportError:
	from SimpleHTTPServer import SimpleHTTPRequestHandler

try:
	from socketserver import TCPServer, ThreadingMixIn
except ImportError:
	from SocketServer import TCPServer, ThreadingMixIn

def HttpServer(address, base_dir, listeners=None):
	return TCPServer(address, RequestHandler(base_dir, listeners))

def ThreadedHttpServer(address, base_dir, listeners=None):
	return ThreadedTCPServer(address, RequestHandler(base_dir, listeners))

class ThreadedTCPServer(ThreadingMixIn, TCPServer):
	pass

class RequestHandler(object):

	__slots__ = ('base_dir', 'listeners',)

	def __init__(self, base_dir, listeners):
		self.base_dir = base_dir
		self.listeners = listeners

	def __call__(self, *args, **kargs):
		handler = self._handler(*args, base_dir=self.base_dir,
			listeners=self.listeners, **kargs)
		return handler

	class _handler(SimpleHTTPRequestHandler):
		def __init__(self, *args, **kargs):
			self.base_dir = kargs.pop("base_dir", ".")
			self.listeners = kargs.pop("listeners", None)
			if self.listeners is None:
				self.listeners = ()
			SimpleHTTPRequestHandler.__init__(self, *args, **kargs)

		def send_head(self):
			for listener in self.listeners:
				result = listener(self)
				if result.matched:
					return result.rfile
			else:
				return SimpleHTTPRequestHandler.send_head(self)

		def translate_path(self, path):
			"""Translate a /-separated PATH to the local filename syntax."""
			parsed_path = unquote(urlparse(path).path)
			parsed_path = os.path.normpath(parsed_path)
			abs_base_dir = os.path.abspath(self.base_dir).rstrip(os.sep) + os.sep
			parsed_path = os.path.join(abs_base_dir,
				parsed_path.lstrip(os.sep))
			parsed_path = os.path.normpath(parsed_path)

			result = parsed_path
			if not result.startswith(abs_base_dir):
				# don't allow traversal above abs_base_dir via ../
				result = abs_base_dir

			return result

class RequestResult(object):
	__slots__ = ('matched', 'rfile')
	def __init__(self, matched, rfile):
		self.matched = matched
		self.rfile = rfile
