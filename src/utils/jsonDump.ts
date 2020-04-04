import fs from 'fs';

import logger from './logger';
import VideoInfo from '../models/VideoInfo';

export default function dumpJson(videoInfo: VideoInfo, jsonDump: string) {
    fs.writeFile(`./data/${jsonDump}`, JSON.stringify(videoInfo), (err: any) => {
        if (err) logger.error(err);
    });
}
