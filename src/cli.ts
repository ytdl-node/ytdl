import commander, { Command } from 'commander';

import logger from './utils/logger';
import Ytdl from './ytdl';
import packageJson from '../package.json';

/**
 * Sets options in the `program`.
 * @param program Stores the commander.Command object
 */
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

/**
 * Parses the options specified in `program`.
 * @param program Stores the commander.Command program
 */
async function parseOptions(program: commander.Command): Promise<void> {
    const programOpts = program.opts();
    let optionsCount = 0;
    Object.keys(programOpts).forEach((programOpt) => {
        if (programOpts[programOpt]) optionsCount += 1;
    });

    if (optionsCount <= 1) program.help();

    if (
        (
            program.download
            || program.info
            || program.size
        )
        && !program.link
    ) {
        logger.error('Link not specified, use -l or --link to specify.');
        return;
    }

    const ytdl = await Ytdl.init(program.link);
    ytdl.setLogLevel('info');

    const options = {
        audioOnly: !!program.audioOnly,
        videoOnly: !!program.videoOnly,
    };

    const quality = program.quality || 'any';
    if (program.size) {
        logger.info(`Size: ${ytdl.info.size(quality)}`);
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

    if (program.download) {
        const filename = program.filename || `${ytdl.info.videoTitle}.mp4`;

        // TODO: download by itag
        logger.info(`Downloading: ${ytdl.info.videoTitle}`);

        await ytdl.download(quality, filename, options);
    }
}

/**
 * Main function for CLI, to be exported.
 * @param args Stores process.argv as string array
 */
export default async function cli(args: string[]): Promise<void> {
    const program = new Command();

    program.version(packageJson.version);

    setOptions(program);
    program.parse(args);
    await parseOptions(program);
}

export {
    cli,
};
