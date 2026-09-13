const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
    // Enable CORS for local testing if needed
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Kunde inte ladda index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    } 
    else if (req.url === '/api/svt') {
        // Proxy the request to SVT
        https.get('https://valresultat.svt.se/2026/', (svtRes) => {
            // Forward headers except those that might mess up the response (like encoding if we manipulate it, or strict CSP)
            const headers = { ...svtRes.headers };
            delete headers['content-security-policy'];
            delete headers['x-frame-options'];
            
            res.writeHead(svtRes.statusCode, headers);
            svtRes.pipe(res);
        }).on('error', (e) => {
            res.writeHead(500);
            res.end('Proxy error: ' + e.message);
        });
    } 
    else {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`Servern är igång!`);
    console.log(`Öppna din webbläsare och gå till:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`==============================================\n`);
});

