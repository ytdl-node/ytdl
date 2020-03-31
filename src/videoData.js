const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');

function getVideoId(url) {
    const urlRegex = /^(["']|)((((https)|(http)):\/\/|)(www\.|)youtube\.com\/watch\?v=)[\w]*(["']|)$/;
    if (!urlRegex.test(url)) {
        throw new Error('Invalid URL.');
    }
    return url.split('watch?v=')[1];
}

function validateParsedResponse(parsedResponse) {
    if (!parsedResponse) throw new Error('parsedResponse not provided.');
    if (!parsedResponse.player_response) throw new Error('Invalid parsedResponse.');
    return true;
}

async function getVideoInfo(videoId, filename) {
    const videoIdRegex = /^[\w]+$/;
    if (!videoIdRegex.test(videoId)) {
        throw new Error('Invalid videoId.');
    }
    const response = await axios.get(`http://youtube.com/get_video_info?video_id=${videoId}`);
    const parsedResponse = querystring.parse(response.data);

    validateParsedResponse(parsedResponse);

    if (filename) {
        fs.writeFile(`./data/${filename}`, parsedResponse.player_response, (err) => {
            if (err) throw err;
            return true;
        });
    }
    return parsedResponse;
}

function getVideoTitle(parsedResponse) {
    validateParsedResponse(parsedResponse);
    return JSON.parse(parsedResponse.player_response).videoDetails.title;
}

function getVideoTime(parsedResponse) {
    validateParsedResponse(parsedResponse);
    return JSON.parse(parsedResponse.player_response).videoDetails.lengthSeconds;
}

function getVideoDescription(parsedResponse) {
    validateParsedResponse(parsedResponse);
    return JSON.parse(parsedResponse.player_response).videoDetails.shortDescription;
}

module.exports = {
    getVideoId,
    getVideoInfo,
    getVideoTitle,
    getVideoTime,
    getVideoDescription,
    validateParsedResponse,
};
