import axios from 'axios';
import { URLSearchParams } from 'url';

import VideoInfo from './models/VideoInfo';
import between from './utils/between';
import extractActions from './utils/signature';
import downloader, { fetchContentByItag } from './downloader';

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
        const urlRegexPrimary = /^(["']|)((((https)|(http)):\/\/|)(www\.|m\.|music\.|gaming\.|)youtube\.com\/watch\?v=)[\w_-]*(["']|)$/i;
        const urlRegexSecondary = /^(["']|)(((https)|(http)):\/\/|)youtu.be\/[\w_-]*(["']|)$/i;
        if (!urlRegexPrimary.test(url) && !urlRegexSecondary.test(url)) {
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
        let lengthSeconds = Number(this.videoInfo.videoDetails.lengthSeconds);

        const minute = 60;
        const hour = 60 * minute;

        const hours = Math.floor(lengthSeconds / hour);
        lengthSeconds -= hour * hours;
        const minutes = Math.floor(lengthSeconds / minute);
        lengthSeconds -= minute * minutes;
        const seconds = lengthSeconds;

        function lpad(target: string, padString: string, length: Number) {
            let str = target;
            while (str.length < length) str = padString + str;
            return str;
        }

        let time = lpad(hours.toString(), '0', 2);
        time += `:${lpad(minutes.toString(), '0', 2)}`;
        time += `:${lpad(seconds.toString(), '0', 2)}`;

        return time;
    }

    private getVideoDescription(): string {
        return this.videoInfo.videoDetails.shortDescription;
    }

    public static async getVideoInfo(videoId: string): Promise<VideoInfo> {
        const videoIdRegex = /^[\w_-]+$/;
        if (!videoIdRegex.test(videoId)) {
            throw new Error('Invalid videoId.');
        }

        const body = await axios.get(
            `https://www.youtube.com/watch?v=${videoId}&hl=en&bpctr=${Math.ceil(Date.now() / 1000)}`, {
                headers: {
                    'User-Agent': '',
                },
            },
        );

        const jsonStr = between(body.data, 'ytplayer.config = ', '</script>');
        const config = JSON.parse(jsonStr.slice(0, jsonStr.lastIndexOf(';ytplayer.load')));

        let playerResponse = JSON.parse(config.args.player_response);

        if (!config.args.player_response) {
            const eurl = `https://youtube.googleapis.com/v/${videoId}`;
            const response = await axios.get(
                `https://www.youtube.com/get_video_info?video_id=${videoId}&el=embedded&eurl=${eurl}&sts=18333`,
            );
            playerResponse = JSON.parse(
                Object.fromEntries(new URLSearchParams(response.data)).player_response,
            );
        }

        const { playabilityStatus, videoDetails, streamingData } = playerResponse;

        const html5playerfileResponse = await axios.get(`https://www.youtube.com${config.assets.js}`);

        const tokens = extractActions(html5playerfileResponse.data);

        const videoInfo = <VideoInfo>{
            playabilityStatus,
            videoDetails,
            streamingData,
            tokens,
        };

        return videoInfo;
    }

    public async download(
        quality: string,
        filename: string,
        options?: {
            audioOnly?: boolean;
            videoOnly?: boolean;
        },
    ): Promise<void> {
        return downloader(this.videoInfo, quality, filename, options);
    }

    public async downloadByItag(itag: Number, filename: string): Promise<void> {
        return fetchContentByItag(this.videoInfo, itag, filename);
    }

    public info() {
        return {
            id: this.videoId,
            title: this.videoTitle,
            time: this.videoTime,
            description: this.videoDescription,
        };
    }
}
