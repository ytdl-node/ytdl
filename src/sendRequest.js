const fs = require('fs');
const https = require('https');

async function sendRequest(filename) {
    const options = {
        hostname: 'csivit.com',
        port: 443,
        path: '/',
        method: 'GET',
    };

    const req = https.request(options, (res) => {
        res.on('data', (data) => {
            fs.appendFile(`./data/${filename}`, data, 'UTF-8', (err) => {
                if (err) throw err;
            });
        });
    });

    req.on('error', (err) => {
        throw err;
    });

    req.end();
}

module.exports = sendRequest;
