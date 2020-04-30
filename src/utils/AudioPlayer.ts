/* eslint global-require: "off" */
import { ReadStream } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

import Player from './player';

export default class AudioPlayer implements Player {
    url: string;

    stream: ReadStream;

    player: string;

    Speaker: any;

    constructor() {
        this.url = '';
        this.player = 'ytdl-mp3';

        this.Speaker = require('speaker');
    }

    /**
     * Play video given a url and a stream.
     * @param url Stream URL
     * @param stream Media stream
     */
    public play(url: string, stream: ReadStream) {
        this.url = url;
        this.stream = stream;
        ffmpeg(stream).toFormat('s16le').pipe(new this.Speaker());
    }
}
