const ffbinaries = require('ffbinaries');
const readline = require('readline');
const cliProgress = require('cli-progress');
const { join } = require('path');
const { promisify } = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const downloadBinaries = promisify(ffbinaries.downloadBinaries);


function ask() {
    return new Promise((resolve) => {
        rl.question('ytdl may not download some videos correctly without these components. Would you like to download these components? (Y/n): ', (input) => resolve(input));
    });
}

async function downloadComponents(components, destination) {
    const multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: '[{bar}] {percentage}% | {filename} | ETA: {eta}s | {value}/{total}',
    }, cliProgress.Presets.shades_classic);

    const bars = components.map((comp) => multibar.create(100, 0, {
        filename: comp,
    }));
    await downloadBinaries(components, {
        destination,
        tickerFn: (progress) => {
            components.forEach((comp, i) => {
                if (progress.filename.indexOf(comp) > -1) {
                    bars[i].update(Math.floor(progress.progress * 100), {
                        filename: progress.filename,
                    });
                }
            });
        },
    });
}

async function main() {
    const components = ['ffmpeg', 'ffprobe'];

    console.log('Searching for ffmpeg and ffprobe in PATH');
    const bins = ffbinaries.locateBinariesSync(components);

    const missing = components.filter((comp) => !bins[comp].found);
    if (missing.length > 0) {
        console.warn(`The following components are missing in your PATH: ${missing.join(' ')}`);
        const answer = await ask();
        if (answer.toLowerCase() !== 'n') {
            const destination = join(__dirname, 'node_modules/.bin');
            console.log('\nDownloading...\n');
            await downloadComponents(missing, destination);
            console.log(`Downloaded ${missing.join(',')} sucesfully. The binaries have been stored in ${destination}`);
        }
    } else {
        console.log(`${components.join(',')} present in PATH, no need to install.`);
    }

    process.exit(0);
}


main();
