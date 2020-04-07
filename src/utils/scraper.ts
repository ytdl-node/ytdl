import miniget from 'miniget';
import logger from './logger';

function between(data: string, left: string, right: string): string {
    let reqData = data;

    let pos = reqData.indexOf(left);
    if (pos === -1) { return ''; }
    reqData = reqData.slice(pos + left.length);

    pos = reqData.indexOf(right);
    if (pos === -1) { return ''; }
    reqData = reqData.slice(0, pos);

    return reqData;
}

export default async function scraper(videoId: string) {
    const [, body] = await miniget.promise(`https://www.youtube.com/watch?v=${videoId}`);

    const jsonStr = between(body, 'ytplayer.config = ', '</script>');

    let config;
    if (jsonStr) {
        const endOfJSON = jsonStr.lastIndexOf(';ytplayer.load');
        config = JSON.parse(jsonStr.slice(0, endOfJSON));
        logger.info(config.assets.js);

        const [, JSBody] = await miniget.promise(`https://www.youtube.com${config.assets.js}`);
        logger.info(JSBody);
    }
}
