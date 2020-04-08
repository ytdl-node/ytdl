import fs from 'fs';

import logger from './logger';
import VideoInfo from '../models/VideoInfo';

export default function dumpJson(videoInfo: VideoInfo, jsonDump: string) {
    fs.writeFile(`./data/${jsonDump}`, JSON.stringify(videoInfo), (err: Error) => {
        if (err) logger.error(err);
    });
}

export function dumpToFile(data: string, filename: string) {
    fs.writeFile(`./data/${filename}`, data, (err: Error) => {
        if (err) logger.error(err);
    });
}
