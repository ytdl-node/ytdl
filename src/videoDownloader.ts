import axios from 'axios';
import fs from 'fs';
import { Logger } from 'winston';
import ProgressBar from './utils/progressBar';

export default class VideoDownloader {
    readonly url: string;

    private readonly logger: Logger;

    /**
     * Cretes an object of `VideoDownloader` with member functions to download and stream content.
     * @param url Stores the url
     */
    constructor(url: string, logger?: Logger) {
        this.url = url;
        this.logger = logger;
    }

    /**
     * Returns a `Node.js` stream obtained by sending a GET request to `this.url`.
     * @param headers Stores optional headers as object
     */
    public async stream(headers?: object, preText?: string) {
        const stream = await axios({
            method: 'get',
            url: this.url,
            responseType: 'stream',
            headers,
        });

        if (this.logger) {
            const progressBar = new ProgressBar(stream.headers['content-length'], preText, this.logger);
            stream.data.on('data', (chunk: string) => {
                progressBar.update(chunk.length);
            });
        }
        return stream.data;
    }

    /**
     * Saves the downloaded stream to a file specified by `filename`.
     * @param filename Stores the filename to store the downloaded stream in
     */
    public async download(filename: string): Promise<void> {
        const videoStream = await this.stream({}, 'Downloading');

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
