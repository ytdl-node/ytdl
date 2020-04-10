import logger from './utils/logger';

import getDownloadLink from './getDownloadLink';
import VideoData from './videoData';
import dumpJson from './utils/jsonDump';
import { fetchContentByItag } from './downloader';
// import downloader from './downloader';
// import { dumpToFile } from './utils/jsonDump';
// import scraper from './utils/scraper';

export default async function runner() {
    // Added temporarily, 'npm start <youtubeLink>' or 'ts-node src/index.js <youtubeLink> works
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

    // dumpToFile(await scraper(videoId), 'scraped.js');
    // downloader(videoInfo, '360p', 'audio.mp4');
    dumpJson(videoInfo, 'downloaded.json');
    fetchContentByItag(videoInfo, 396, 'something.mp4');
}

runner();
