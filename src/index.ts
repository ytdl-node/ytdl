import Ytdl from './ytdl';

import mergeStreams from './utils/mergeStreams';
import getDownloadLink from './utils/getDownloadLink';

export default function init(link: string): Promise<Ytdl> {
    return Ytdl.init(link);
}

// export * from './cli';

export {
    mergeStreams,
    getDownloadLink,
    init,
};
