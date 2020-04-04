import axios from 'axios';
import { URLSearchParams } from 'url';

import VideoInfo from './models/VideoInfo';
import logger from './utils/logger';

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

    private static validateParsedResponse(videoInfo: VideoInfo) {
        if (videoInfo.playabilityStatus.status === 'UNPLAYABLE') {
            return new Error('Video Unplayable');
        }
        if (!videoInfo.streamingData) {
            return new Error('Invalid videoInfo.streamingData');
        }
        return true;
    }

    private getVideoTitle(): string {
        return this.videoInfo.videoDetails.title;
    }

    private getVideoTime(): string {
        return this.videoInfo.videoDetails.lengthSeconds;
    }

    private getVideoDescription(): string {
        return this.videoInfo.videoDetails.shortDescription;
    }

    public static async getVideoInfo(videoId: string): Promise<VideoInfo> {
        const videoIdRegex = /^[\w_-]+$/;
        if (!videoIdRegex.test(videoId)) {
            throw new Error('Invalid videoId.');
        }
        const response = await axios.get(`http://youtube.com/get_video_info?video_id=${videoId}`);
        const parsedResponse = Object.fromEntries(new URLSearchParams(response.data));
        // TODO: Add functionality in logger to debug things to a file
        // if (filename) {
        //     fs.writeFile(`./data/${filename}`, parsedResponse.player_response, (err) => {
        //         if (err) { throw err; }
        //         return true;
        //     });
        // }

        const jsonResponse = JSON.parse(parsedResponse.player_response);
        const { playabilityStatus, videoDetails, streamingData } = jsonResponse;
        const videoInfo = <VideoInfo> { playabilityStatus, videoDetails, streamingData };

        return videoInfo;
    }
}
