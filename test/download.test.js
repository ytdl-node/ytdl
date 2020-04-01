const assert = require('assert');
const fs = require('fs');
const VideoData = require('../src/videoData');

const testVideoId = 'fJ9rUzIMcZQ';
const testVideoInfoFile = 'download.json';

describe('Download', () => {
    it('Should run the download function', async () => {
        const videoInfo = await VideoData.getVideoInfo(testVideoId, testVideoInfoFile);
        assert.equal(VideoData.validateParsedResponse(videoInfo), true);
    }).timeout(5000);
    it('Should download in data directory', () => {
        assert.equal(fs.existsSync('./data/download.json'), true);
    });
});
