import Ytdl from './ytdl';
import mergeStreams from './utils/mergeStreams';
import getDownloadLink from './utils/getDownloadLink';
import fetch from './videoDownloader';

const npmPath = require('npm-path');

npmPath.setSync();

/**
 * Returns an object of type Ytdl, with member functions for downloading, streaming, info, etc.
 * @param link Stores the YouTube link
 */
export default function init(link: string): Promise<Ytdl> {
    return Ytdl.init(link);
}

/**
 * Returns an object of type Ytdl, with member functions for downloading, streaming, info, etc.
 * @param name Stores the name of the video to be searched
 */
export function fromName(name: string): Promise<Ytdl> {
    return Ytdl.fromName(name);
}

export * from './cli';

export {
    mergeStreams,
    getDownloadLink,
    fetch,
    init,
};
