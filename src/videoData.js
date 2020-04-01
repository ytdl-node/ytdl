const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');

class VideoData {
    constructor(videoId, videoInfo) {
        this.videoId = videoId;
        this.videoInfo = videoInfo;
        this.videoTitle = this.getVideoTitle();
        this.videoTime = this.getVideoTime();
        this.videoDescription = this.getVideoDescription();
    }

    static getVideoId(url) {
        const urlRegex = /^(["']|)((((https)|(http)):\/\/|)(www\.|)youtube\.com\/watch\?v=)[\w_-]*(["']|)$/;
        if (!urlRegex.test(url)) {
            throw new Error('Invalid URL.');
        }
        return url.split('watch?v=')[1];
    }

    static async fromLink(link) {
        const videoId = VideoData.getVideoId(link);
        const videoInfo = await VideoData.getVideoInfo(videoId);

        VideoData.validateParsedResponse(videoInfo);

        return new VideoData(videoId, videoInfo);
    }

    static validateParsedResponse(parsedResponse) {
        if (!parsedResponse) { throw new Error('parsedResponse not provided.'); }
        if (!parsedResponse.player_response) { throw new Error('Invalid parsedResponse.'); }
    }

    static async getVideoInfo(videoId, filename) {
        const videoIdRegex = /^[\w_-]+$/;
        if (!videoIdRegex.test(videoId)) {
            throw new Error('Invalid videoId.');
        }
        const response = await axios.get(`http://youtube.com/get_video_info?video_id=${videoId}`);
        const parsedResponse = querystring.parse(response.data);
        if (filename) {
            fs.writeFile(`./data/${filename}`, parsedResponse.player_response, (err) => {
                if (err) { throw err; }
                return true;
            });
        }
        return parsedResponse;
    }

    getVideoTitle() {
        return JSON.parse(this.videoInfo.player_response).videoDetails.title;
    }

    getVideoTime() {
        return JSON.parse(this.videoInfo.player_response).videoDetails.lengthSeconds;
    }

    getVideoDescription() {
        return JSON.parse(this.videoInfo.player_response).videoDetails.shortDescription;
    }
}

module.exports = VideoData;
