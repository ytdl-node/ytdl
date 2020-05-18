const ffbinaries = require('ffbinaries');
const readline = require('readline');
const { promisify } = require('util');
const { join } = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = promisify(rl.question);
const downloadBinaries = promisify(ffbinaries.downloadBinaries);

async function main() {
    const components = ['ffmpeg', 'ffprobe'];

    console.log(process.env.PATH);
    console.log('Searching for ffmpeg and ffprobe in PATH');
    const bins = ffbinaries.locateBinariesSync(components);

    const missing = components.filter((comp) => !bins[comp].found);

    if (missing.length > 0) {
        console.warn(`The following components are missing in your PATH: ${missing.join(' ')}`);
        let answer = await prompt(`ytdl may not download some videos correctly without these components. Would you
        like to download these components?`);

        if (answer.toLowerCase() === 'n') return;
        
        const destination = join(__dirname, 'bin');
        console.log('Downloading...');
        await downloadBinaries(missing, destination);
        console.log(`Downloaded ${missing.join(',')} sucesfully. The binaries have been stored in ${destination}`);
    } else {
        console.log(`${components.join(',')} present in PATH, no need to install.`);
    }

    process.exit(0);
}


main();
