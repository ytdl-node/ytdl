import { URLSearchParams } from 'url';
import axios from 'axios';
import fs from 'fs';

import VideoInfo, { Format, AdaptiveFormat } from './models/VideoInfo';

import logger from './utils/logger';
import { decipher } from './utils/signature';
import mergeStreams from './utils/mergeStreams';
import deleteFile from './utils/deleteFile';

export async function fetch(url: string, filename: string, headers?: object): Promise<void> {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url,
            responseType: 'stream',
            headers,
        })
            .then((response) => {
                response.data
                    .pipe(fs.createWriteStream(filename))
                    .on('finish', (err: Error) => {
                        if (err) reject(err);
                        else resolve();
                    });
            })
            .catch((err) => {
                logger.error(`Failed to download, status code: ${err.response.status}`);
            });
    });
}

function getHeaders(url: string): object {
    const host = url.split('/videoplayback')[0].split('https://')[1];
    return {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8,de-DE;q=0.7,de;q=0.6,bn;q=0.5,la;q=0.4',
        Connection: 'keep-alive',
        Host: host,
        Origin: 'https://www.youtube.com',
        Referer: 'https://www.youtube.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    };
}

export function fetchFormatDataByItag(
    videoInfo: VideoInfo,
    itag: Number,
): {
        url: string,
        fmt: Format | AdaptiveFormat,
    } {
    let url: string;
    let fmt: Format | AdaptiveFormat;
    const { tokens } = videoInfo;

    function callback(format: Format | AdaptiveFormat) {
        if (format.itag === itag) {
            fmt = format;
            if (format.url) {
                url = format.url;
            } else {
                const link = Object.fromEntries(new URLSearchParams(format.cipher));

                const sig = tokens && link.s ? decipher(tokens, link.s) : null;
                url = `${link.url}&${link.sp || 'sig'}=${sig}`;
            }
        }
    }
    videoInfo.streamingData.formats.forEach(callback);

    if (!url) {
        videoInfo.streamingData.adaptiveFormats.forEach(callback);
    }

    return {
        url,
        fmt,
    };
}

export async function fetchContentByItag(
    videoInfo: VideoInfo,
    itag: Number,
    filename: string,
): Promise<void> {
    const { url } = fetchFormatDataByItag(videoInfo, itag);

    if (url) {
        logger.info('Fetching content...');
        await fetch(url, filename, getHeaders(url));
        logger.info('Downloaded content...');
    } else {
        logger.error('No links found matching specified options.');
    }
}

export function fetchFormatData(
    videoInfo: VideoInfo,
    qualityLabel: string,
    options?: { audioOnly?: boolean, videoOnly?: boolean },
): {
        url: string,
        fmt: Format | AdaptiveFormat,
    } {
    type audioMapping = {
        [key: string]: string
    };
    const audioMappings: audioMapping = {
        high: 'AUDIO_QUALITY_HIGH',
        medium: 'AUDIO_QUALITY_MEDIUM',
        low: 'AUDIO_QUALITY_LOW',
        AUDIO_QUALITY_HIGH: 'AUDIO_QUALITY_HIGH',
        AUDIO_QUALITY_MEDIUM: 'AUDIO_QUALITY_MEDIUM',
        AUDIO_QUALITY_LOW: 'AUDIO_QUALITY_LOW',
    };

    let opts = options;

    if (!opts) {
        opts = { audioOnly: false, videoOnly: false };
    } else if (opts.audioOnly && opts.videoOnly) {
        throw new Error('audioOnly and videoOnly can\'t be true simultaneously.');
    }

    let url: string;
    let fmt: Format | AdaptiveFormat;

    const { tokens } = videoInfo;

    function common(format: Format | AdaptiveFormat): string {
        if (format.url) {
            return format.url;
        }
        const link = Object.fromEntries(new URLSearchParams(format.cipher));

        const sig = tokens && link.s ? decipher(tokens, link.s) : null;
        return `${link.url}&${link.sp || 'sig'}=${sig}`;
    }

    function callback(format: Format | AdaptiveFormat): void {
        const mimeType = 'video/mp4';
        if (format.qualityLabel === qualityLabel && format.mimeType.includes(mimeType)) {
            url = common(format);
            fmt = format;
        }
    }

    function audioCallback(format: Format | AdaptiveFormat): void {
        const mimeType = 'audio/mp4';
        if (format.mimeType.includes(mimeType)
            && (qualityLabel === 'any' ? true : format.audioQuality === audioMappings[qualityLabel])) {
            url = common(format);
            fmt = format;
        }
    }

    // TODO: url is always the last URL in the array, check if this needs to be changed

    if (!opts.audioOnly && !opts.videoOnly) {
        videoInfo.streamingData.formats.forEach(callback);
    } else if (options.videoOnly) {
        videoInfo.streamingData.adaptiveFormats.forEach(callback);
    } else {
        videoInfo.streamingData.adaptiveFormats.forEach(audioCallback);
    }

    return {
        url,
        fmt,
    };
}

export default async function fetchContent(
    videoInfo: VideoInfo,
    qualityLabel: string,
    filename: string,
    options?: { audioOnly?: boolean, videoOnly?: boolean },
): Promise<void> {
    const { url } = fetchFormatData(videoInfo, qualityLabel, options);

    let opts = options;

    if (!opts) {
        opts = { audioOnly: false, videoOnly: false };
    } else if (opts.audioOnly && opts.videoOnly) {
        throw new Error('audioOnly and videoOnly can\'t be true simultaneously.');
    }

    if (url) {
        let content = 'video';
        if (opts.audioOnly) {
            content = 'audio stream';
        } else if (opts.videoOnly) {
            content = 'video stream';
        }

        logger.info(`Fetching ${content}...`);
        await fetch(url, filename, getHeaders(url));
        logger.info(`Downloaded ${content}.`);
    } else if (!opts.audioOnly && !opts.videoOnly) {
        await Promise.all([
            fetchContent(videoInfo, qualityLabel, `vid-${filename}`, { videoOnly: true }),
            fetchContent(videoInfo, 'any', `aud-${filename}`, { audioOnly: true }),
        ]);

        logger.info('Merging streams...');
        await mergeStreams(`vid-${filename}`, `aud-${filename}`, filename);
        logger.info('Finished merging!');

        await Promise.all([
            deleteFile(`vid-${filename}`),
            deleteFile(`aud-${filename}`),
        ]);

        logger.info('Video download complete.');
    } else {
        logger.error('No links found matching specified options.');
    }
}

export {
    fetchContent,
};
