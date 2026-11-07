from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
versions={'current':'v1','offline':False}
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if versions['offline']:
   self.connection.close();return
  if self.path.split('?')[0]=='/which-word/sw.js':
   key=self.headers.get('User-Agent',''); version=versions['current']
   data=Path('sw.js').read_text().replace('which-word-v1','which-word-'+version).encode()
   self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
  else:super().do_GET()
 def __init__(self,*args,**kw):super().__init__(*args,directory='..',**kw)
class Control(SimpleHTTPRequestHandler):
 def do_POST(self):
  value=self.rfile.read(int(self.headers['Content-Length'])).decode()
  if self.path=='/offline':versions['offline']=value=='true'
  else:versions['current']=value;versions['offline']=False
  self.send_response(200);self.end_headers()
Thread(target=ThreadingHTTPServer(('127.0.0.1',4174),Control).serve_forever,daemon=True).start()
ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
