import ytdl, {} from '..';

async function main(): Promise<void> {
    const video = await ytdl('https://www.youtube.com/watch?v=A7ry4cx6HfY');

    /**
     * Get information about the video
     */

    const {
        id,
        title,
        time,
        description,
    } = video.info.all();

    console.log(`Video ID: ${id}`);
    console.log(`Video Title: ${title}`);
    console.log(`Video Time: ${time}`);
    console.log(`Video Description: ${description}`);


    /**
     * Get the size of the video
     */

    const size = <number> video.info.size('360p');
    console.log(`Video Size: ${Math.round(size / (1024 * 1024))}M`);

    /**
     * Get video as Node.js stream
     */
    const stream = await video.stream('360p');

    /**
     * Download video using quality
     */

    await video.download('any', './data/ytdl.mp3', { audioOnly: true });
    await video.download('360p', './data/ytdl.mp4');

    /**
     * Download video using itag
     */
    await video.downloadByItag(18, './data/ytdlItag.mp4');
}

main();
