import ffmpeg from 'fluent-ffmpeg';

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
