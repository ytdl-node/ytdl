const readline = require('readline');

async function getFilename() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const filename = () => new Promise((resolve) => {
        rl.question('Enter the filename: ', (name) => {
            rl.close();
            resolve(name);
        });
    });

    return filename();
}

module.exports = getFilename;
