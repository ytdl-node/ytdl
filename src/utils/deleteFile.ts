import fs from 'fs';

export default async function deleteFile(filename: string) {
    return new Promise((resolve, reject) => {
        fs.unlink(`./data/${filename}`, (err) => {
            if (err) {
                if (err.code === 'ENOENT') resolve();
                reject(err);
            } else resolve();
        });
    });
}
