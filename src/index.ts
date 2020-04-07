import logger from './utils/logger';

import getDownloadLink from './getDownloadLink';
import VideoData from './videoData';
import downloader from './downloader';
import dumpJson, { dumpToFile } from './utils/jsonDump';

import scraper from './utils/scraper';

export default async function runner() {
    // Added temporarily, 'npm start <youtubeLink>' or 'node src/index.js <youtubeLink> works
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
    logger.info(`Video Time: ${videoTime} seconds`);
    logger.info(`Video Description:\n ${videoDescription}`);

    dumpToFile(await scraper(videoId), 'scraped.js');
    dumpJson(videoInfo, 'downloaded.json');
    downloader(videoInfo, '480p', 'video.mp4');
}

runner();
