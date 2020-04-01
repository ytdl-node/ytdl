const { Command } = require('commander');
const logger = require('./utils/logger');
const VideoData = require('./videoData');

function setOptions(program) {
    program
        .option('-d, --debug', 'output extra debugging')
        .option('-i, --info <url>', 'info about YouTube link');
}

async function parseOptions(program) {
    if (program.debug) {
        logger.info(program.opts());
    }
    if (program.info) {
        const {
            videoId, videoTitle, videoTime, videoDescription,
        } = await VideoData.fromLink(program.info);

        logger.info(`Video ID: ${videoId}`);
        logger.info(`Video Title: ${videoTitle}`);
        logger.info(`Video Time: ${videoTime} seconds`);
        logger.info(`Video Description:\n ${videoDescription}`);
    }
}

async function cli(args) {
    const program = new Command();
    program.version('0.0.1');

    setOptions(program);
    program.parse(args);
    await parseOptions(program);
}

module.exports = {
    cli,
};
