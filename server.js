const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.startsWith('/api/svt')) {
        const urlObj = new URL(req.url, 'http://localhost');
        const svtPath = urlObj.searchParams.get('path') || '';
        const svtUrl = 'https://valresultat.svt.se/2026/' + svtPath;

        https.get(svtUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (svtRes) => {
            const headers = { ...svtRes.headers };
            delete headers['content-security-policy'];
            delete headers['x-frame-options'];
            res.writeHead(svtRes.statusCode, headers);
            svtRes.pipe(res);
        }).on('error', (e) => {
            res.writeHead(500);
            res.end('Proxy error: ' + e.message);
        });
        return;
    }

    // Static file serving with SPA fallback
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            const mimeType = ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'text/html';
            res.writeHead(200, { 'Content-Type': mimeType + '; charset=utf-8' });
            fs.createReadStream(filePath).pipe(res);
        } else {
            // SPA fallback: Return index.html for any 404 (like /karlskrona)
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
        }
    });

}).listen(PORT, () => {
    console.log(`Servern är igång på http://localhost:${PORT}`);
});

