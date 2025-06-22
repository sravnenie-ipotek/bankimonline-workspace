#!/usr/bin/env python3
"""
Simple HTTP server to serve the YouTrack Reports Dashboard
Run this script and open http://localhost:8000/youtrack-reports-dashboard.html
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"📊 YouTrack Reports Dashboard Server")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📱 Dashboard URL: http://localhost:{PORT}/youtrack-reports-dashboard.html")
        print(f"🛑 Press Ctrl+C to stop the server")
        print("-" * 60)
        
        try:
            # Auto-open browser
            webbrowser.open(f'http://localhost:{PORT}/youtrack-reports-dashboard.html')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()