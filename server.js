const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const RESOURCE_DIR = path.join(__dirname, 'Resource');
const ORDER_FILE = path.join(__dirname, 'order.json');

// Ensure Resource dir exists
if (!fs.existsSync(RESOURCE_DIR)) {
    fs.mkdirSync(RESOURCE_DIR);
}

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files from root

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, RESOURCE_DIR);
    },
    filename: (req, file, cb) => {
        // Keep original filename, but ensure uniqueness if needed (simple version here)
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// API: Get List of GIFs (Sorted if order exists)
app.get('/api/gifs', (req, res) => {
    fs.readdir(RESOURCE_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Failed to read directory' });

        let images = files.filter(file => /\.(gif|jpg|jpeg|png)$/i.test(file));

        // Apply Sort Order if exists
        if (fs.existsSync(ORDER_FILE)) {
            try {
                const order = JSON.parse(fs.readFileSync(ORDER_FILE, 'utf8'));
                // Sort images based on the order array
                images.sort((a, b) => {
                    const indexA = order.indexOf(a);
                    const indexB = order.indexOf(b);
                    // If both present, sort by index. If one missing, put at end.
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return 0; // Keep original order if neither in list
                });
            } catch (e) {
                console.error("Error reading order.json", e);
            }
        }

        res.json(images);
    });
});

const { exec } = require('child_process');

// API: Upload Files
app.post('/api/upload', upload.array('files'), (req, res) => {
    // Files are already saved by Multer
    const filenames = req.files.map(f => f.filename).join(', ');
    console.log(`Uploaded: ${filenames}. Syncing to GitHub...`);

    // Run git commands to sync
    exec('git add Resource/ && git commit -m "Auto-upload new GIFs" && git push', (error, stdout, stderr) => {
        if (error) {
            console.error(`Git sync error: ${error.message}`);
            // Return success for the upload itself, but warn about Git
            return res.json({
                message: 'Upload successful (Local only - Git sync failed)',
                files: req.files.map(f => f.filename),
                gitError: error.message
            });
        }
        console.log(`Git sync output: ${stdout}`);
        res.json({
            message: 'Upload successful and synced to GitHub!',
            files: req.files.map(f => f.filename)
        });
    });
});

// API: Save Reorder
app.post('/api/reorder', (req, res) => {
    const newOrder = req.body.order; // Expects JSON: { order: ["file1.gif", "file2.gif"] }
    if (!newOrder || !Array.isArray(newOrder)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    fs.writeFile(ORDER_FILE, JSON.stringify(newOrder, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save order' });
        res.json({ message: 'Order saved' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop.');
});
