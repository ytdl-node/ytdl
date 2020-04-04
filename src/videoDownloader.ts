import { URLSearchParams } from 'url';
import axios from 'axios';
import fs from 'fs';

import VideoInfo from './models/VideoInfo';

export function fetchLinks(videoInfo: VideoInfo, qualityLabel: string) {
    const urls: Array<string> = [];

    videoInfo.streamingData.adaptiveFormats.forEach((adaptiveFormat) => {
        if (adaptiveFormat.qualityLabel === qualityLabel) {
            urls.push(adaptiveFormat.url
                || Object.fromEntries(new URLSearchParams(adaptiveFormat.cipher)).url);
        }
    });

    const host = urls[0].split('/videoplayback')[0].split('https://')[1];
    console.log(host);
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
            response.data.pipe(fs.createWriteStream('./data/video.mp4'));
        });
}

export function fetchAudioStream(videoInfo: VideoInfo, quality: string) {
    const urls: Array<string> = [];

    videoInfo.streamingData.adaptiveFormats.forEach((adaptiveFormat) => {
        if (adaptiveFormat.quality === quality) {
            urls.push(adaptiveFormat.url
                || Object.fromEntries(new URLSearchParams(adaptiveFormat.cipher)).url);
        }
    });

    const host = urls[0].split('/videoplayback')[0].split('https://')[1];
    console.log(host);
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
            response.data.pipe(fs.createWriteStream('./data/audio.mp4'));
        });
}

export default async function download(links: string[]) {
    console.log(links);
}
