import { URLSearchParams } from 'url';
import axios from 'axios';
import fs from 'fs';

import VideoInfo from './models/VideoInfo';
import logger from './utils/logger';
import decodeSignature from './utils/decodeSignature';

export function download(urls: string[], filename: string) {
    const host = urls[0].split('/videoplayback')[0].split('https://')[1];
    axios({
        method: 'get',
        url: urls[0],
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
                    if (err) throw err;
                    else logger.info('Download complete.');
                });
        });
}

export default function fetchContent(
    videoInfo: VideoInfo,
    qualityLabel: string, filename: string,
    options?: { audioOnly?: boolean, videoOnly?: boolean },
) {
    const urls: Array<string> = [];
    let { formats } = videoInfo.streamingData;
    let mimeType = 'video/mp4';
    let opts = options;
    if (!opts) {
        opts = { audioOnly: false, videoOnly: false };
    }

    if (opts.audioOnly) {
        formats = videoInfo.streamingData.adaptiveFormats;
        mimeType = 'audio/mp';
    } else if (opts.videoOnly) {
        formats = videoInfo.streamingData.adaptiveFormats;
    }

    formats.forEach((format) => {
        if (opts.audioOnly
            ? (format.quality === qualityLabel
                && format.mimeType.includes(mimeType))
            : (format.qualityLabel === qualityLabel
                && format.mimeType.includes(mimeType))) {
            if (format.url) {
                urls.push(format.url);
            } else {
                const link = Object.fromEntries(new URLSearchParams(format.cipher));
                // TODO: Instead of link.s, add decoded link.s
                urls.push(`${link.url}&${link.sp}=${decodeSignature(link.s)}`);
            }
        }
    });

    if (urls.length) {
        logger.info('Fetching content...');
        download(urls, filename);
    } else {
        logger.error('No links found matching specified options.');
    }
}
