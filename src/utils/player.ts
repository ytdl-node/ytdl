import { ReadStream } from 'fs';

export default abstract class Player {
    player: string;

    /**
     * Play media given a URL and a stream source
     */
    public abstract play(url: string, stream: ReadStream): unknown;
}
