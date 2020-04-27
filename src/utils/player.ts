import { spawn } from 'child_process';

export default class Player {
    private options: object;

    player: string;

    media: string;

    constructor(media: string, player?: string) {
        this.options = { stdio: 'ignore' };
        this.setPlayer(player);
        this.media = media;
    }

    /**
     * Select player to play media using.
     * @param player Stores the media player
     */
    private setPlayer(player?: string): void {
        const players = [
            'cvlc',
            'vlc',
            'mplayer',
            'afplay',
            'mpg123',
            'mpg321',
            'play',
            'omxplayer',
            'aplay',
            'cmdmp3',
        ];

        this.player = player || 'cvlc';

        if (players.indexOf(this.player) === -1) {
            throw new Error(`${this.player} is not a compatible media player.`);
        }
    }

    /**
     * Play media from `this.media` using `this.player`.
     */
    public play() {
        const subprocess = spawn(this.player, [this.media], this.options);
        if (!subprocess) {
            throw new Error(`Unable to spawn subprocess with ${this.player}`);
        }

        subprocess.on('close', () => { process.exit(0); });
        return subprocess;
    }
}
