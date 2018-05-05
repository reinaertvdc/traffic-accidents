#!/usr/bin/env python

import os
import webbrowser
import SimpleHTTPServer

os.chdir('docs')

webbrowser.open_new_tab('http://localhost:8080')

SimpleHTTPServer.BaseHTTPServer.HTTPServer(
    ('localhost', 8080),
    SimpleHTTPServer.SimpleHTTPRequestHandler
).serve_forever()
