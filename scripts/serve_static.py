#!/usr/bin/env python3
"""
Simple HTTP server to serve the circuit viewer files
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the directory containing the files
    os.chdir(Path(__file__).parent)
    
    handler = CORSHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚀 Circuit Viewer Server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🔗 Open this URL: http://localhost:{PORT}/dynamic_circuit_viewer.html")
        print(f"⚡ Dynamic JSON reload enabled - change any JSON file and see updates!")
        print(f"🛑 Press Ctrl+C to stop the server")
        
        try:
            # Open browser automatically
            webbrowser.open(f"http://localhost:{PORT}/dynamic_circuit_viewer.html")
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped. Goodbye!")

if __name__ == "__main__":
    main()