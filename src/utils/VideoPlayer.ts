import { spawn } from 'child_process';
import { ReadStream } from 'fs';

import Player from './player';

export default class VideoPlayer implements Player {
    private options: object;

    private players = [
        'cvlc',
        'vlc',
        'mplayer',
        'afplay',
        'play',
        'omxplayer',
        'aplay',
        'cmdmp3',
    ];

    player: string = '';

    media: string;

    constructor(player: string) {
        this.setPlayer(player);
    }

    /**
     * Select player to play media using.
     * @param player Stores the media player
     */
    private setPlayer(player: string): void {
        this.player = player || 'cvlc';
        if (this.players.indexOf(this.player) === -1) {
            throw new Error(`${this.player} is not a compatible media player.`);
        }
    }

    /**
     * Play video given a url and a stream.
     * @param url Stream URL
     * @param stream Media stream
     */
    public play(url: string, stream: ReadStream) {
        stream.destroy(); // Video player does not support streams right now
        const subprocess = spawn(this.player, [url], { stdio: 'ignore' });
        if (!subprocess) {
            throw new Error(`Unable to spawn subprocess with ${this.player}`);
        }

        subprocess.on('close', () => { process.exit(0); });
        return subprocess;
    }
}
