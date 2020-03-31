const readline = require('readline');

async function getDownloadLink() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const downloadLink = () => new Promise((resolve) => {
        rl.question('Enter the YouTube link: ', (name) => {
            rl.close();
            resolve(name);
        });
    });

    return downloadLink();
}

module.exports = getDownloadLink;
