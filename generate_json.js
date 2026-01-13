const fs = require('fs');
const path = require('path');

const RESOURCE_DIR = path.join(__dirname, 'Resource');
const OUTPUT_FILE = path.join(__dirname, 'gifs.json');

try {
    const files = fs.readdirSync(RESOURCE_DIR);
    const gifs = files.filter(file => file.toLowerCase().endsWith('.gif'));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gifs, null, 2));
    console.log(`Successfully generated gifs.json with ${gifs.length} GIFs.`);
} catch (err) {
    console.error('Error generating gifs.json:', err);
    process.exit(1);
}
