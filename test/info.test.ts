import { expect } from 'chai';
import ytdl from '../src/index';
import VideoData from '../src/videoData';

async function checkInstance() {
    const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
    return video.info instanceof VideoData;
}

async function checkData() {
    const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
    return video.info.all().id === 'fJ9rUzIMcZQ';
}

describe('Check Info', () => {
    it('Should be an instance of VideoData', async () => {
        expect(await checkInstance()).to.be.true;
    });
    it('Should have same video-id', async () => {
        expect(await checkData()).to.be.true;
    });
});
