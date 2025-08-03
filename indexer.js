const fs = require('fs');
const path = require('path');
const { exiftool } = require('exiftool-vendored');
const sharp = require('sharp');

const PHOTO_DIR = './photos';
const OUTPUT = './index.json';
const PREVIEW_DIR_NAME = 'previews';
const MAX_PREVIEW_SIZE = 800;

async function getFoldersWithFiles() {
    const folders = fs.readdirSync(PHOTO_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    const result = [];

    for (const folder of folders) {
        const folderName = folder.name;
        const folderPath = path.join(PHOTO_DIR, folderName);
        const previewPath = path.join(folderPath, PREVIEW_DIR_NAME);

        if (!fs.existsSync(previewPath)) {
            fs.mkdirSync(previewPath);
        }

        const files = fs.readdirSync(folderPath)
            .filter(file => /\.(jpe?g|png|webp)$/i.test(file));

        const filesWithMetadata = [];

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const baseName = path.parse(file).name;
            const previewFileName = baseName + '.webp';
            const previewFilePath = path.join(previewPath, previewFileName);

            if (!fs.existsSync(previewFilePath)) {
                try {
                    await sharp(filePath)
                        .rotate()
                        .resize({ width: MAX_PREVIEW_SIZE, height: MAX_PREVIEW_SIZE, fit: 'inside' })
                        .webp({ quality: 70 })
                        .toFile(previewFilePath);
                    console.log(`Preview created: ${previewFilePath}`);
                } catch (e) {
                    console.error(`Failed to create preview for ${filePath}`, e);
                }
            }

            try {
                const tags = await exiftool.read(filePath);
                const dateTaken = tags.DateTimeOriginal || tags.CreateDate || null;

                filesWithMetadata.push({
                    filename: file,
                    dateTaken: dateTaken ? dateTaken.toISOString() : null,
                    previewPath: `${folderName}/${PREVIEW_DIR_NAME}/${previewFileName}`
                });
            } catch (e) {
                filesWithMetadata.push({
                    filename: file,
                    dateTaken: null,
                    previewPath: `${folderName}/${PREVIEW_DIR_NAME}/${previewFileName}`
                });
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
    console.log('index.json generated!');
})();
