const express = require('express');
const ytdl = require('@ytdl/ytdl');

const app = express();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port: ${process.env.PORT || 3000}`);
});

async function streamer(link) {
    const video = await ytdl.init(link);
    const stream = await video.stream('360p');
    const { title } = video.info.all();
    return { stream, title };
}

app.get('/download', async (req, res) => {
    const { link } = req.query;
    console.log(link);

    if (!link) {
        res.send('Send link as request query with name link.');
        return;
    }

    try {
        const { stream, title } = await streamer(link);

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        stream.pipe(res);
    } catch (err) {
        res.send('Error has occurred.');
    }
});
