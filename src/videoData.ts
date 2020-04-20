import axios from 'axios';
import { URLSearchParams } from 'url';

import VideoInfo, { Format, AdaptiveFormat } from './models/VideoInfo';
import between from './utils/between';
import extractActions, { decipher } from './utils/signature';

export default class VideoData {
    readonly videoId: string;

    readonly videoTitle: string;

    readonly videoTime: string;

    readonly videoDescription: string;

    private readonly videoInfo: VideoInfo;

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

    private static async getVideoInfo(videoId: string): Promise<VideoInfo> {
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

    public fetchFormatData(
        qualityLabel: string,
        options?: { audioOnly?: boolean, videoOnly?: boolean },
    ): {
            url: string,
            fmt: Format | AdaptiveFormat,
        } {
        type audioMapping = {
            [key: string]: string
        };
        const audioMappings: audioMapping = {
            high: 'AUDIO_QUALITY_HIGH',
            medium: 'AUDIO_QUALITY_MEDIUM',
            low: 'AUDIO_QUALITY_LOW',
            AUDIO_QUALITY_HIGH: 'AUDIO_QUALITY_HIGH',
            AUDIO_QUALITY_MEDIUM: 'AUDIO_QUALITY_MEDIUM',
            AUDIO_QUALITY_LOW: 'AUDIO_QUALITY_LOW',
        };

        let opts = options;

        if (!opts) {
            opts = { audioOnly: false, videoOnly: false };
        } else if (opts.audioOnly && opts.videoOnly) {
            throw new Error('audioOnly and videoOnly can\'t be true simultaneously.');
        }

        let url: string;
        let fmt: Format | AdaptiveFormat;

        const { tokens } = this.videoInfo;

        function common(format: Format | AdaptiveFormat): string {
            if (format.url) {
                return format.url;
            }
            const link = Object.fromEntries(new URLSearchParams(format.cipher));

            const sig = tokens && link.s ? decipher(tokens, link.s) : null;
            return `${link.url}&${link.sp || 'sig'}=${sig}`;
        }

        function callback(format: Format | AdaptiveFormat): void {
            const mimeType = 'video/mp4';
            if (format.qualityLabel === qualityLabel && format.mimeType.includes(mimeType)) {
                url = common(format);
                fmt = format;
            }
        }

        function audioCallback(format: Format | AdaptiveFormat): void {
            const mimeType = 'audio/mp4';
            if (format.mimeType.includes(mimeType)
                && (qualityLabel === 'any' ? true : format.audioQuality === audioMappings[qualityLabel])) {
                url = common(format);
                fmt = format;
            }
        }

        // TODO: url is always the last URL in the array, check if this needs to be changed

        if (!opts.audioOnly && !opts.videoOnly) {
            this.videoInfo.streamingData.formats.forEach(callback);
        } else if (options.videoOnly) {
            this.videoInfo.streamingData.adaptiveFormats.forEach(callback);
        } else {
            this.videoInfo.streamingData.adaptiveFormats.forEach(audioCallback);
        }

        return {
            url,
            fmt,
        };
    }

    public fetchFormatDataByItag(
        itag: Number,
    ): {
            url: string,
            fmt: Format | AdaptiveFormat,
        } {
        let url: string;
        let fmt: Format | AdaptiveFormat;
        const { tokens } = this.videoInfo;

        function callback(format: Format | AdaptiveFormat) {
            if (format.itag === itag) {
                fmt = format;
                if (format.url) {
                    url = format.url;
                } else {
                    const link = Object.fromEntries(new URLSearchParams(format.cipher));

                    const sig = tokens && link.s ? decipher(tokens, link.s) : null;
                    url = `${link.url}&${link.sp || 'sig'}=${sig}`;
                }
            }
        }
        this.videoInfo.streamingData.formats.forEach(callback);

        if (!url) {
            this.videoInfo.streamingData.adaptiveFormats.forEach(callback);
        }

        return {
            url,
            fmt,
        };
    }

    public size(
        qualityLabelOrItag: string | Number,
        options?: { audioOnly?: boolean, videoOnly?: boolean },
    ): Number {
        let format;
        if (typeof qualityLabelOrItag === 'string') {
            format = this.fetchFormatData(qualityLabelOrItag, options).fmt;
        } else if (typeof qualityLabelOrItag === 'number') {
            format = this.fetchFormatDataByItag(qualityLabelOrItag).fmt;
        } else {
            return 0;
        }
        return Number(format.contentLength);
    }

    public all() {
        return {
            id: this.videoId,
            title: this.videoTitle,
            time: this.videoTime,
            description: this.videoDescription,
        };
    }
}
