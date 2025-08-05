#!/usr/bin/env python3

import http.server
import socketserver
import os
import sys
import errno
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
    
    # List available files with error handling
    try:
        if os.path.exists("youtrackReports"):
            files = os.listdir("youtrackReports")
            json_files = [f for f in sorted(files) if f.endswith('.json')]
            if json_files:
                for f in json_files:
                    print(f"  - youtrackReports/{f}")
            else:
                print("  - No JSON files found in youtrackReports directory")
        else:
            print("  - youtrackReports directory not found")
    except OSError as e:
        print(f"  - Error accessing youtrackReports directory: {e}")
    
    print("\nServer logs:")
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"✅ Server successfully started on port {port}")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server stopped by user.")
                return
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port.")
            print(f"   Suggestion: python3 server.py {port + 1}")
        else:
            print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    port = 52530
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port: {sys.argv[1]}")
            sys.exit(1)
    
    run_server(port)