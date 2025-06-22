#!/usr/bin/env python3
"""
Simple HTTP server for YouTrack Reports Dashboard with automatic port detection
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import socket

def find_free_port():
    """Find an available port"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Find an available port
    port = find_free_port()
    
    with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
        dashboard_url = f"http://localhost:{port}/youtrack-reports-dashboard.html"
        
        print("🎯" + "="*60)
        print("📊 YouTrack Reports Dashboard Server")
        print("🌐 Server running at: http://localhost:{}".format(port))
        print("📱 Dashboard URL: {}".format(dashboard_url))
        print("🛑 Press Ctrl+C to stop the server")
        print("="*60)
        
        try:
            # Auto-open browser
            webbrowser.open(dashboard_url)
            print("🚀 Opening dashboard in your browser...")
        except Exception as e:
            print(f"⚠️  Could not auto-open browser: {e}")
            print(f"🔗 Please manually open: {dashboard_url}")
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()