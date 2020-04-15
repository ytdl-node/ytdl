import fs from 'fs';

import logger from './logger';
import VideoInfo from '../models/VideoInfo';

export default async function dumpJson(videoInfo: VideoInfo, jsonDump: string) {
    return new Promise((resolve) => {
        fs.writeFile(`./data/${jsonDump}`, JSON.stringify(videoInfo), (err: Error) => {
            if (err) logger.error(err);
            resolve();
        });
    });
}

export async function dumpToFile(data: string, filename: string) {
    return new Promise((resolve) => {
        fs.writeFile(`./data/${filename}`, data, (err: Error) => {
            if (err) logger.error(err);
            resolve();
        });
    });
}
