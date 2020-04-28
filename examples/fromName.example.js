const ytdl = require('..');

async function play() {
    const video = await ytdl.fromName('Another Day');
    video.play('any');
}

play();
