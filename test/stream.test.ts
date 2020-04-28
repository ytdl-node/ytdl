import { expect } from 'chai';
import stream from 'stream';
import ytdl from '../src/index';

async function checkStreams() {
    const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
    const videoStream = await video.stream('360p');
    const videoStreamByItag = await video.streamByItag(18);
    return videoStream instanceof stream.Readable && videoStreamByItag instanceof stream.Readable;
}

describe('Check Streams', () => {
    it('Should get a Node.js stream object', async () => {
        expect(await checkStreams()).to.be.true;
    });
});
