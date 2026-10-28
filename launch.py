"""Serve this static portfolio locally and open it in the default web browser."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import os
import webbrowser

os.chdir(Path(__file__).resolve().parent)

with ThreadingHTTPServer(("127.0.0.1", 0), SimpleHTTPRequestHandler) as server:
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"\nPortfolio running at {url}\nPress Ctrl+C to stop.\n", flush=True)
    Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
