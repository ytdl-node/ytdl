import commander, { Command } from 'commander';

import logger from './utils/logger';
import Ytdl from './ytdl';

function setOptions(program: commander.Command): void {
    program
        .option('-i, --info <url>', 'info about YouTube link')
        .option('-d, --download <url>', 'download from YouTube link')
        .option('-fn, --filename <filename>', 'filename of downloaded content')
        .option('-q, --quality <quality>', 'quality of downloaded content')
        .option('-ao, --audio-only', 'download only audio stream')
        .option('-vo, --video-only', 'download only video stream');
}

async function parseOptions(program: commander.Command): Promise<void> {
    if (program.download) {
        const ytdl = await Ytdl.init(program.download);

        const filename = program.filename || 'ytdl.mp4';
        const options = {
            audioOnly: !!program.audioOnly,
            videoOnly: !!program.videoOnly,
        };

        let quality = '360p';
        if (options.audioOnly) {
            quality = 'any';
        }

        quality = program.quality || quality;
        // TODO: download by itag

        await ytdl.download(quality, filename, options);
    }

    if (program.info) {
        const ytdl = await Ytdl.init(program.info);
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
