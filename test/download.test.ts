/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import ytdl from '../src/index';

async function videoDownloader() {
    const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
    await video.download('360p', 'data/ytdl.mp4');
    return true;
}

async function videoDownloaderByItag() {
    const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
    await video.downloadByItag(396, 'data/ytdlItag.mp4');
    return true;
}

describe('Download', () => {
    it('Should download the sample video', async (done) => {
        expect(await videoDownloader()).to.be.true;
        done();
    });

    it('Should be able to download by itag', async (done) => {
        expect(await videoDownloaderByItag()).to.be.true;
        done();
    });
});
