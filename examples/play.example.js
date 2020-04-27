const ytdl = require('..'); // require('@ytdl/ytdl');

/**
 * This function players audio from 'https://www.youtube.com/watch?v=A7ry4cx6HfY' on locally installed 'mplayer'
 */
async function play() {
    const video = await ytdl.init('https://www.youtube.com/watch?v=A7ry4cx6HfY');
    video.play('any', { audioOnly: true }, 'mplayer');
}

play();
