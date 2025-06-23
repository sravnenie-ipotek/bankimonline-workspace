#!/usr/bin/env python3

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Print all requests for debugging
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format % args))

def run_server(port=52530):
    handler = CORSHTTPRequestHandler
    
    print(f"Starting server on port {port}...")
    print(f"Dashboard URL: http://localhost:{port}/youtrack-reports-dashboard.html")
    print(f"Test URL: http://localhost:{port}/test-fetch.html")
    print(f"\nServing files from: {os.getcwd()}")
    print("\nAvailable YouTrack files:")
    
    # List available files
    if os.path.exists("youtrackReports"):
        files = os.listdir("youtrackReports")
        for f in sorted(files):
            if f.endswith('.json'):
                print(f"  - youtrackReports/{f}")
    
    print("\nServer logs:")
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            return

if __name__ == "__main__":
    port = 52530
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port: {sys.argv[1]}")
            sys.exit(1)
    
    run_server(port)