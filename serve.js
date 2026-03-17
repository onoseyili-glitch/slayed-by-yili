const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  const html = fs.readFileSync('./testimony-timer.html');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
}).listen(8000, () => console.log('Server running on http://localhost:8000'));
