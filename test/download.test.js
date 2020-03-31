const assert = require('assert');
const fs = require('fs');
const videoData = require('../src/videoData');

const testVideoId = 'fJ9rUzIMcZQ';
const testVideoInfoFile = 'download.json';

describe('Download', () => {
    it('Should run the download function', async () => {
        const videoInfo = await videoData.getVideoInfo(testVideoId, testVideoInfoFile);
        assert.equal(videoData.validateParsedResponse(videoInfo), true);
    });
    it('Should download in data directory', () => {
        assert.equal(fs.existsSync('./data/download.json'), true);
    });
});
