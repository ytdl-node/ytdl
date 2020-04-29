import { ReadStream } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

import Player from './player';

const Speaker = require('speaker');


export default class AudioPlayer implements Player {
    url: string;

    stream: ReadStream;

    /**
     * Play video given a url and a stream.
     * @param url Stream URL
     * @param stream Media stream
     */
    public play(url: string, stream: ReadStream) {
        this.url = url;
        this.stream = stream;
        ffmpeg(stream).toFormat('s16le').pipe(new Speaker());
    }
}
