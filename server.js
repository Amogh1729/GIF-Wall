const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const RESOURCE_DIR = path.join(__dirname, 'Resource');

const MIMETYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    // API Endpoint: Get list of GIFs
    if (req.url === '/api/gifs') {
        fs.readdir(RESOURCE_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read directory' }));
                return;
            }

            const gifs = files.filter(file => file.toLowerCase().endsWith('.gif'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(gifs));
        });
        return;
    }

    // Static File Serving
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Allow serving from Resource directory
    if (req.url.startsWith('/Resource/')) {
        filePath = '.' + req.url;
        // Decode URI components to handle spaces/special chars in filenames
        filePath = decodeURIComponent(filePath);
    }

    const extname = path.extname(filePath);
    const contentType = MIMETYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop.');
});
