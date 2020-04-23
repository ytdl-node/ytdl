import Ytdl from './ytdl';

import mergeStreams from './utils/mergeStreams';
import getDownloadLink from './utils/getDownloadLink';
import fetch from './videoDownloader';

/**
 * Returns an object of type Ytdl, with member functions for downloading, streaming, info, etc.
 * @param link Stores the YouTube link
 */
export default function init(link: string): Promise<Ytdl> {
    return Ytdl.init(link);
}

export * from './cli';

export {
    mergeStreams,
    getDownloadLink,
    fetch,
    init,
};
