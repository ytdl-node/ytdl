import fs from 'fs';

/**
 * Deletes the file specified by `filename`.
 * @param filename Stores the file name
 */
export default async function deleteFile(filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(filename, (err) => {
            if (err) {
                if (err.code === 'ENOENT') resolve();
                reject(err);
            } else resolve();
        });
    });
}
