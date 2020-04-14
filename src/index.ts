import logger from './utils/logger';

import getDownloadLink from './getDownloadLink';
import VideoData from './videoData';
import dumpJson from './utils/jsonDump';
import downloader from './downloader';


export default async function runner() {
    // TODO: Added temporarily, 'npm start <youtubeLink>', 'ts-node src/index.js <youtubeLink> works
    const downloadLink = process.argv[2] || await getDownloadLink();
    const {
        videoId,
        videoTitle,
        videoTime,
        videoDescription,
        videoInfo,
    } = await VideoData.fromLink(downloadLink);

    logger.info(`Video ID: ${videoId}`);
    logger.info(`Video Title: ${videoTitle}`);
    logger.info(`Video Time: ${videoTime}`);
    logger.info(`Video Description:\n ${videoDescription}`);

    downloader(videoInfo, '480p', 'video.mp4');
    dumpJson(videoInfo, 'downloaded.json');
    // fetchContentByItag(videoInfo, 396, 'video2.mp4');
}

runner();
