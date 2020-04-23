import ffmpeg from 'fluent-ffmpeg';

/**
 * Uses system ffmpeg binaries to add `audioFile` to `videoFile`.
 * @param videoFile Stores video file
 * @param audioFile Stores audio file
 * @param outputFile Stores output file
 */
export default async function mergeStreams(
    videoFile: string,
    audioFile: string,
    outputFile: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(videoFile)
            .input(audioFile)
            .saveToFile(outputFile)
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve();
            });
    });
}
