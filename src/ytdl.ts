import { Logger } from 'winston';

import VideoData from './videoData';
import VideoDownloader from './videoDownloader';
import mergeStreams from './utils/mergeStreams';
import deleteFile from './utils/deleteFile';
import { createLogger } from './utils/logger';

export default class Ytdl {
    readonly link: string;

    readonly info: VideoData;

    private videoDownloader: VideoDownloader;

    logger: Logger;

    constructor(link: string, videoData: VideoData) {
        this.link = link;
        this.info = videoData;
        this.logger = createLogger('error');
    }

    public static async init(link: string): Promise<Ytdl> {
        const videoData = await VideoData.fromLink(link);
        return new Ytdl(link, videoData);
    }

    public setLogLevel(level: string) {
        this.logger = createLogger(level);
    }

    public async download(
        qualityLabel: string,
        filename: string,
        options?: { audioOnly?: boolean, videoOnly?: boolean },
    ): Promise<boolean> {
        let opts = options;

        if (!opts) {
            opts = { audioOnly: false, videoOnly: false };
        } else if (opts.audioOnly && opts.videoOnly) {
            throw new Error('audioOnly and videoOnly can\'t be true simultaneously.');
        }

        if (!filename || typeof filename !== 'string') {
            throw new Error('filename is missing.');
        }

        const { url } = this.info.fetchFormatData(qualityLabel, options);

        if (url) {
            let content = 'video';
            if (opts.audioOnly) {
                content = 'audio stream';
            } else if (opts.videoOnly) {
                content = 'video stream';
            }

            this.logger.info(`Fetching ${content}...`);
            if (!this.videoDownloader || !(this.videoDownloader.url === url)) {
                this.videoDownloader = new VideoDownloader(url);
            }

            await this.videoDownloader.download(filename);
            this.logger.info(`Downloaded ${content}.`);
        } else if (!opts.audioOnly && !opts.videoOnly) {
            await Promise.all([
                this.download(qualityLabel, `${filename}.vid`, { videoOnly: true }),
                this.download('any', `${filename}.aud`, { audioOnly: true }),
            ]);

            this.logger.info('Merging streams...');
            await mergeStreams(`${filename}.vid`, `${filename}.aud`, filename);
            this.logger.info('Finished merging!');

            await Promise.all([
                deleteFile(`${filename}.vid`),
                deleteFile(`${filename}.aud`),
            ]);

            this.logger.info('Video download complete.');
        } else {
            this.logger.error('No links found matching specified options.');
            return false;
        }
        return true;
    }

    public async downloadByItag(itag: number, filename: string): Promise<boolean> {
        if (!filename || typeof filename !== 'string') {
            throw new Error('filename is missing.');
        }

        const { url } = this.info.fetchFormatDataByItag(itag);

        if (url) {
            this.logger.info('Fetching content...');
            if (!this.videoDownloader || !(this.videoDownloader.url === url)) {
                this.videoDownloader = new VideoDownloader(url);
            }

            await this.videoDownloader.download(filename);
            this.logger.info('Downloaded content...');
        } else {
            this.logger.error('No links found matching specified options.');
            return false;
        }
        return true;
    }

    public async stream(
        qualityLabel: string,
        options?: { audioOnly?: boolean, videoOnly?: boolean },
        headers?: object,
    ) {
        const { url } = this.info.fetchFormatData(qualityLabel, options);
        if (!url) {
            return Promise.resolve();
        }

        if (!this.videoDownloader || !(this.videoDownloader.url === url)) {
            this.videoDownloader = new VideoDownloader(url);
        }

        return this.videoDownloader.stream(headers);
    }
}
