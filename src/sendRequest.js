const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');

async function sendRequest(filename) {
    const response = await axios.get('http://youtube.com/get_video_info?video_id=AmBQPfbM1mg');
    const parsedResponse = querystring.parse(response.data);
    fs.writeFile(`./data/${filename}`, parsedResponse.player_response, (err) => {
        if (err) throw err;
    });
}

module.exports = sendRequest;
