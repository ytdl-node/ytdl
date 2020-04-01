import axios from 'axios';
import { URLSearchParams } from 'url';

import VideoInfo from './models/youtube';

export default class VideoData {
    readonly videoId: string;

    readonly videoInfo: VideoInfo;

    readonly videoTitle: string;

    readonly videoTime: string;

    readonly videoDescription: string;

    constructor(videoId: string, videoInfo: VideoInfo) {
        this.videoId = videoId;
        this.videoInfo = videoInfo;
        this.videoTitle = this.getVideoTitle();
        this.videoTime = this.getVideoTime();
        this.videoDescription = this.getVideoDescription();
    }

    static async fromLink(link: string): Promise<VideoData> {
        const videoId = VideoData.getVideoId(link);
        const videoInfo = await VideoData.getVideoInfo(videoId);

        VideoData.validateParsedResponse(videoInfo);

        return new VideoData(videoId, videoInfo);
    }

    private static getVideoId(url: string): string {
        const urlRegex = /^(["']|)((((https)|(http)):\/\/|)(www\.|)youtube\.com\/watch\?v=)[\w_-]*(["']|)$/;
        if (!urlRegex.test(url)) {
            throw new Error('Invalid URL.');
        }
        return url.split('watch?v=')[1];
    }

    private static validateParsedResponse(parsedResponse: VideoInfo) {
        if (!parsedResponse) { throw new Error('parsedResponse not provided.'); }
        if (!parsedResponse.player_response) { throw new Error('Invalid parsedResponse.'); }
    }

    private getVideoTitle(): string {
        return JSON.parse(this.videoInfo.player_response).videoDetails.title;
    }

    private getVideoTime(): string {
        return JSON.parse(this.videoInfo.player_response).videoDetails.lengthSeconds;
    }

    private getVideoDescription(): string {
        return JSON.parse(this.videoInfo.player_response).videoDetails.shortDescription;
    }

    public static async getVideoInfo(videoId: string): Promise<VideoInfo> {
        const videoIdRegex = /^[\w_-]+$/;
        if (!videoIdRegex.test(videoId)) {
            throw new Error('Invalid videoId.');
        }
        const response = await axios.get(`http://youtube.com/get_video_info?video_id=${videoId}`);
        const parsedResponse = <unknown> Object.fromEntries(new URLSearchParams(response.data));
        // TODO: Add functionality in logger to debug things to a file
        // if (filename) {
        //     fs.writeFile(`./data/${filename}`, parsedResponse.player_response, (err) => {
        //         if (err) { throw err; }
        //         return true;
        //     });
        // }
        return parsedResponse as VideoInfo;
    }
}
