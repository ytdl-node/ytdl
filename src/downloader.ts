import { URLSearchParams } from 'url';
import axios from 'axios';
import fs from 'fs';

import VideoInfo, { Format, AdaptiveFormat } from './models/VideoInfo';

import logger from './utils/logger';
import getTokens from './utils/scraper';
import { decipher } from './utils/signature';
import mergeStreams from './utils/mergeStreams';
import deleteFile from './utils/deleteFile';

export async function download(url: string, filename: string) {
    return new Promise((resolve, reject) => {
        const host = url.split('/videoplayback')[0].split('https://')[1];
        axios({
            method: 'get',
            url,
            responseType: 'stream',
            headers: {
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
            },
        })
            .then((response) => {
                response.data
                    .pipe(fs.createWriteStream(`./data/${filename}`))
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

export async function fetchContentByItag(
    videoInfo: VideoInfo,
    itag: Number,
    filename: string,
) {
    let url: string;
    const tokens = await getTokens(videoInfo.videoDetails.videoId);

    function callback(format: Format | AdaptiveFormat) {
        if (format.itag === itag) {
            if (format.url) {
                url = format.url;
            } else {
                const link = Object.fromEntries(new URLSearchParams(format.cipher));

                const sig = tokens && link.s ? decipher(tokens, link.s) : null;

                logger.info(`s = ${link.s}`);
                logger.info(`sig = ${sig}`);
                url = `${link.url}&sig=${sig}`;
            }
        }
    }
    videoInfo.streamingData.formats.forEach(callback);

    if (!url) {
        videoInfo.streamingData.adaptiveFormats.forEach(callback);
    }

    logger.info(url);

    if (url) {
        logger.info('Fetching content...');
        await download(url, filename);
        logger.info('Downloaded content...');
    } else {
        logger.error('No links found matching specified options.');
    }
}

export default async function fetchContent(
    videoInfo: VideoInfo,
    qualityLabel: string,
    filename: string,
    options?: { audioOnly?: boolean, videoOnly?: boolean },
) {
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
    const urls: Array<string> = [];
    logger.info('Getting tokens');
    const tokens = await getTokens(videoInfo.videoDetails.videoId);

    let { formats } = videoInfo.streamingData;
    let mimeType = 'video/mp4';
    let opts = options;

    if (!opts) {
        opts = { audioOnly: false, videoOnly: false };
    }
    if (opts.audioOnly && opts.videoOnly) {
        throw new Error('audioOnly and videoOnly can\'t be true simultaneously.');
    }

    if (opts.audioOnly) {
        formats = videoInfo.streamingData.adaptiveFormats;
        mimeType = 'audio/mp';
    } else if (opts.videoOnly) {
        formats = videoInfo.streamingData.adaptiveFormats;
    }

    formats.forEach(async (format) => {
        if (opts.audioOnly
            ? ((format.audioQuality === audioMappings[qualityLabel]
                || format.quality === 'tiny') // If no audio found for specified quality
                && format.mimeType.includes(mimeType))
            : (format.qualityLabel === qualityLabel
                && format.mimeType.includes(mimeType))) {
            if (format.url) {
                urls.push(format.url);
            } else {
                const link = Object.fromEntries(new URLSearchParams(format.cipher));
                logger.info(`s = ${link.s}`);

                const deciphered = decipher(tokens, link.s);
                logger.info(`sig = ${deciphered}`);
                urls.push(`${link.url}&${link.sp}=${deciphered}`);
            }
        }
    });

    const url = urls[0];
    if (url) {
        let content = 'video';
        if (opts.audioOnly) {
            content = 'audio stream';
        } else if (opts.videoOnly) {
            content = 'video stream';
        }

        logger.info(`Fetching ${content}...`);
        await download(url, filename);
        logger.info(`Downloaded ${content}.`);
    } else if (!opts.audioOnly && !opts.videoOnly) {
        await Promise.all([
            fetchContent(videoInfo, qualityLabel, `vid-${filename}`, { videoOnly: true }),
            fetchContent(videoInfo, 'low', `aud-${filename}`, { audioOnly: true }),
        ]);

        await mergeStreams(`vid-${filename}`, `aud-${filename}`, filename);

        await Promise.all([
            deleteFile(`vid-${filename}`),
            deleteFile(`aud-${filename}`),
        ]);

        logger.info('Video download complete.');
    } else {
        logger.error('No links found matching specified options.');
    }
}
