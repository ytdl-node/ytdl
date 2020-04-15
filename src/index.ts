import VideoData from './videoData';
import downloader, { fetchContentByItag } from './downloader';

import mergeStreams from './utils/mergeStreams';
import getDownloadLink from './utils/getDownloadLink';
import dumpVideoInfo, { dumpToFile } from './utils/jsonDump';

export default async function ytdl(
    link: string,
    quality: string,
    filename: string,
    options?: { audioOnly?: boolean, videoOnly?: boolean },
) {
    const { videoInfo } = await VideoData.fromLink(link);
    downloader(videoInfo, quality, filename, options);
}

export async function downloadByItag(
    link: string,
    itag: Number,
    filename: string,
) {
    const { videoInfo } = await VideoData.fromLink(link);
    fetchContentByItag(videoInfo, itag, filename);
}

export async function info(link: string) {
    return VideoData.fromLink(link);
}

export * from './cli';
export * from './downloader';

export {
    mergeStreams,
    getDownloadLink,
    dumpVideoInfo,
    dumpToFile,
    ytdl,
};
