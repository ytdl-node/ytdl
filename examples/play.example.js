const ytdl = require('..'); // require('@ytdl/ytdl');

/**
 * This function players audio from 'https://www.youtube.com/watch?v=A7ry4cx6HfY' on 'ytdl-mp3' player;
 */
async function play() {
    const video = await ytdl.init('https://www.youtube.com/watch?v=A7ry4cx6HfY');
    const player = await video.play('any', { audioOnly: true });
    console.log(`Player: ${player.player}`);
}

play();

/**
 * This function players audio from 'https://www.youtube.com/watch?v=A7ry4cx6HfY' on 'mplayer';
 */
async function playLocal() {
    const video = await ytdl.init('https://www.youtube.com/watch?v=A7ry4cx6HfY');
    const player = await video.play('any', { audioOnly: true }, 'mplayer');
    console.log(`Player: ${player.player}`);
}

playLocal();
