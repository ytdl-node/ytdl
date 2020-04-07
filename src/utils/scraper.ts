import miniget from 'miniget';

function between(data: string, left: string, right: string): string {
    let modifiedData = data;

    let pos = modifiedData.indexOf(left);
    if (pos === -1) { return ''; }
    modifiedData = modifiedData.slice(pos + left.length);

    pos = modifiedData.indexOf(right);
    if (pos === -1) { return ''; }
    modifiedData = modifiedData.slice(0, pos);

    return modifiedData;
}

export default async function scraper(videoId: string): Promise<string> {
    const [, body] = await miniget.promise(`https://www.youtube.com/watch?v=${videoId}`);

    const jsonStr = between(body, 'ytplayer.config = ', '</script>');

    let config;
    if (jsonStr) {
        const endOfJSON = jsonStr.lastIndexOf(';ytplayer.load');
        config = JSON.parse(jsonStr.slice(0, endOfJSON));

        const [, JSBody] = await miniget.promise(`https://www.youtube.com${config.assets.js}`);
        return JSBody;
    }
    return '';
}
