import commander, { Command } from 'commander';

import logger from './utils/logger';
import Ytdl from './ytdl';

function setOptions(program: commander.Command): void {
    program
        .option('-l, --link <url>', 'set the url for the YouTube video')
        .option('-i, --info', 'info about YouTube link')
        .option('-d, --download', 'download from YouTube link')
        .option('-fn, --filename <filename>', 'filename of downloaded content')
        .option('-q, --quality <quality>', 'quality of downloaded content')
        .option('-s, --size', 'get the size of the video to be downloaded')
        .option('-ao, --audio-only', 'download only audio stream')
        .option('-vo, --video-only', 'download only video stream');
}

async function parseOptions(program: commander.Command): Promise<void> {
    if (!program.link) {
        logger.error('Link not specified, use -l or --link to specify.');
        return;
    }

    const ytdl = await Ytdl.init(program.link);

    const options = {
        audioOnly: !!program.audioOnly,
        videoOnly: !!program.videoOnly,
    };

    let quality = '360p';
    if (options.audioOnly) {
        quality = 'any';
    }

    quality = program.quality || quality;

    if (program.download) {
        const filename = program.filename || 'ytdl.mp4';

        // TODO: download by itag

        await ytdl.download(quality, filename, options);
    }

    if (program.info) {
        const {
            id,
            title,
            time,
            description,
        } = ytdl.info.all();

        logger.info(`Video ID: ${id}`);
        logger.info(`Video Title: ${title}`);
        logger.info(`Video Time: ${time} seconds`);
        logger.info(`Video Description:\n ${description}`);
    }

    if (program.size) {
        logger.info(`Size: ${ytdl.info.size(quality)}`);
    }
}

export default async function cli(args: string[]): Promise<void> {
    const program = new Command();
    program.version('0.0.1');

    setOptions(program);
    program.parse(args);
    await parseOptions(program);
}

export {
    cli,
};
