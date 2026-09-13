const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
    // Sätt CORS-headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

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
    else if (req.url.startsWith('/api/svt')) {
        // Parse url for path parameter
        const urlObj = new URL(req.url, 'http://localhost');
        const svtPath = urlObj.searchParams.get('path') || '';
        const svtUrl = 'https://valresultat.svt.se/2026/' + svtPath;

        // Proxy the request to SVT
        https.get(svtUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (svtRes) => {
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

