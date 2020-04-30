import { Logger } from 'winston';

import VideoData from './videoData';
import VideoDownloader from './videoDownloader';
import mergeStreams from './utils/mergeStreams';
import deleteFile from './utils/deleteFile';
import { createLogger } from './utils/logger';
import Player from './utils/player';
import getLinkFromName from './utils/getLinkFromName';
import VideoPlayer from './utils/VideoPlayer';
import AudioPlayer from './utils/AudioPlayer';

export default class Ytdl {
    readonly link: string;

    readonly info: VideoData;

    private videoDownloader: VideoDownloader;

    logger: Logger;

    /**
     * Creates a `Ytdl` object with `link` and `videoData`.
     * @param link Stores the vYouTube link
     * @param videoData Stores a videoData object
     */
    constructor(link: string, videoData: VideoData) {
        this.link = link;
        this.info = videoData;
        this.logger = createLogger('error');
    }

    /**
     * Returns a `Ytdl` object.
     * @param link Stores the YouTube link
     */
    public static async init(link: string): Promise<Ytdl> {
        const videoData = await VideoData.fromLink(link);
        return new Ytdl(link, videoData);
    }

    /**
     * Returns a `Ytdl` object.
     * @param name Stores the name of the video to be searched
     */
    public static async fromName(name: string) {
        return Ytdl.init(await getLinkFromName(name));
    }

    /**
     * Sets logging level as passed in params.
     * @param level Indicates logging level
     */
    public setLogLevel(level: string) {
        this.logger = createLogger(level);
    }

    /**
     * Downloads the stream and stores in a file specified by `filename`.
     * @param qualityLabel Stores the quality
     * @param filename Stores the filename
     * @param options Stores special options like audioOnly or videoOnly
     */
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

    /**
     * Downloads the video by it's `itag` and stores in the file specified by `filename`.
     * @param itag YouTube video itag
     * @param filename Stores the filename
     */
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

    /**
     * Returns a `Node.js` stream for a particular YouTube video.
     * @param qualityLabel Stores the quality
     * @param options Stores special options such as audioOnly or videoOnly
     * @param headers Stores additional headers if any
     */
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

    /**
     * Returns a `Node.js` stream for a particular YouTube video, identifying by it's `itag`.
     * @param itag YouTube video itag
     * @param headers Stores additional headers if any
     */
    public async streamByItag(itag: number, headers?: object) {
        const { url } = this.info.fetchFormatDataByItag(itag);
        if (!url) {
            return Promise.resolve();
        }

        if (!this.videoDownloader || !(this.videoDownloader.url === url)) {
            this.videoDownloader = new VideoDownloader(url);
        }

        return this.videoDownloader.stream(headers);
    }

    /**
     * Play media without downloading it from YouTube, on your locally installed media player.
     * @param qualityLabel Stores the quality
     * @param options Stores special options such as audioOnly or videoOnly
     * @param player Stores the media player (default: cvlc)
     */
    public async play(
        qualityLabel: string | number,
        options?: { audioOnly?: boolean, videoOnly?: boolean },
        player?: string,
    ): Promise<Player> {
        let url: string;
        if (typeof qualityLabel === 'string') {
            url = this.info.fetchFormatData(qualityLabel, options).url;
        } else if (typeof qualityLabel === 'number') {
            url = this.info.fetchFormatDataByItag(qualityLabel).url;
        }

        if (!this.videoDownloader) {
            this.videoDownloader = new VideoDownloader(url);
        }
        let mediaPlayer: Player;

        if (options.audioOnly && !player) {
            try {
                mediaPlayer = new AudioPlayer();
            } catch (e) {
                mediaPlayer = new VideoPlayer();
            }
        } else {
            mediaPlayer = new VideoPlayer(player);
        }
        mediaPlayer.play(this.videoDownloader.url, await this.videoDownloader.stream());
        return mediaPlayer;
    }
}
