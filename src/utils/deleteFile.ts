import fs from 'fs';

export default async function deleteFile(filename: string) {
    const path = `./data/${filename}`;
    return new Promise((resolve, reject) => {
        fs.stat(path, (exists) => {
            if (exists == null) {
                fs.unlink(path, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else if (exists.code === 'ENOENT') {
                resolve();
            }
        });
    });
}
