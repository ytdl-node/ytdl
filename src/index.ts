import VideoData from './videoData';

import mergeStreams from './utils/mergeStreams';
import getDownloadLink from './utils/getDownloadLink';
import dumpVideoInfo, { dumpToFile } from './utils/jsonDump';

export default function init(link: string): Promise<VideoData> {
    return VideoData.fromLink(link);
}

export * from './cli';
export { fetch, fetchContent, fetchContentByItag } from './downloader';

export {
    mergeStreams,
    getDownloadLink,
    dumpVideoInfo,
    dumpToFile,
    init,
};
