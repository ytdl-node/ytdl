import axios from 'axios';
import fs from 'fs';

export default class VideoDownloader {
    readonly url: string;

    constructor(url: string) {
        this.url = url;
    }

    public async stream(headers?: object) {
        const stream = await axios({
            method: 'get',
            url: this.url,
            responseType: 'stream',
            headers,
        });
        return stream.data;
    }

    public async download(filename: string): Promise<void> {
        const videoStream = await this.stream();

        return new Promise((resolve, reject) => {
            videoStream
                .pipe(fs.createWriteStream(filename))
                .on('finish', (err: Error) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    }
}
