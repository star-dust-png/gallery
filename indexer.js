const fs = require('fs');
const path = require('path');
const { exiftool } = require('exiftool-vendored');

const PHOTO_DIR = './photos';
const OUTPUT = './index.json';

async function getFoldersWithFiles() {
    const folders = fs.readdirSync(PHOTO_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    const result = [];

    for (const folder of folders) {
        const folderName = folder.name;
        const folderPath = path.join(PHOTO_DIR, folderName);
        const files = fs.readdirSync(folderPath)
            .filter(file => /\.(jpe?g|png|webp)$/i.test(file));

        const filesWithMetadata = [];

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            try {
                const tags = await exiftool.read(filePath);
                const dateTaken = tags.DateTimeOriginal || tags.CreateDate || null;
                filesWithMetadata.push({
                    filename: file,
                    dateTaken: dateTaken ? dateTaken.toISOString() : null
                });
            } catch (e) {
                filesWithMetadata.push({ filename: file, dateTaken: null });
            }
        }

        result.push({
            folder: folderName,
            files: filesWithMetadata
        });
    }

    await exiftool.end();
    return result;
}

(async () => {
    const data = await getFoldersWithFiles();
    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
    console.log('index.json generated with metadata.');
})();
