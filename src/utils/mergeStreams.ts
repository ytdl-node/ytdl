import ffmpeg from 'fluent-ffmpeg';
import logger from './logger';

export default async function mergeStreams(
    videoFile: string,
    audioFile: string,
    outputFile: string,
) {
    return new Promise((resolve, reject) => {
        ffmpeg(`./data/${videoFile}`)
            .input(`./data/${audioFile}`)
            .saveToFile(`./data/${outputFile}`)
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve();
            });
    });
}
