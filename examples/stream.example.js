const express = require('express');
const ytdl = require('@ytdl/ytdl');

const app = express();

/**
 * Start server on port 3000.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

/**
 * Returns a Node.js stream and the video title.
 */
async function streamer(link) {
    const video = await ytdl.init(link);
    const stream = await video.stream('360p');
    const { title } = video.info.all();
    return { stream, title };
}

/**
 * Get request of the form: http://localhost:3000/download?link=<youtubeLink>
 */
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
