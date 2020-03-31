const assert = require('assert');
const fs = require('fs');
const sendRequest = require('../src/sendRequest');

describe('Download', () => {
    it('Should run the download function', async () => {
        assert.equal(await sendRequest('download.json'), undefined);
    });
    it('Should download in data directory', () => {
        assert.equal(fs.existsSync('./data/download.json'), true);
    });
});
