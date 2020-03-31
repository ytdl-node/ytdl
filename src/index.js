const logger = require('./utils/logger');

const getDownloadLink = require('./getDownloadLink');
const {
    getVideoId,
    getVideoInfo,
    getVideoTitle,
    getVideoTime,
    getVideoDescription,
} = require('./videoData');

async function runner() {
    const downloadLink = await getDownloadLink();
    const videoId = getVideoId(downloadLink);
    const videoInfo = await getVideoInfo(videoId);
    const videoTitle = getVideoTitle(videoInfo);
    const videoTime = getVideoTime(videoInfo);
    const videoDescription = getVideoDescription(videoInfo);

    logger.info(`Video ID: ${videoId}`);
    logger.info(`Video Title: ${videoTitle}`);
    logger.info(`Video Time: ${videoTime} seconds`);
    logger.info(`Video Description:\n ${videoDescription}`);
}

runner();
