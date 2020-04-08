import miniget from 'miniget';
import logger from './logger';
import extractActions from './signature';

const BASE_URL = 'https://www.youtube.com';
const URL = 'https://www.youtube.com/watch?v=';
// const INFO_URL = 'https://www.youtube.com/get_video_info';

function between(data: string, left: string, right: string) {
    let reqData = data;

    let pos = reqData.indexOf(left);
    if (pos === -1) { return ''; }
    reqData = reqData.slice(pos + left.length);

    pos = reqData.indexOf(right);
    if (pos === -1) { return ''; }
    reqData = reqData.slice(0, pos);

    return reqData;
}

export default async function getTokens(id: string) {
    const [, body] = await miniget.promise(URL + id);

    const jsonStr = between(body, 'ytplayer.config = ', '</script>');

    let config;
    if (jsonStr) {
        // To get script wala JS File
        const endOfJSON = jsonStr.lastIndexOf(';ytplayer.load');
        config = JSON.parse(jsonStr.slice(0, endOfJSON));

        const [, JSBody] = await miniget.promise(BASE_URL + config.assets.js);

        logger.info('Getting tokens');
        const tokens = extractActions(JSBody);

        return tokens;
    }

    return [];
}
