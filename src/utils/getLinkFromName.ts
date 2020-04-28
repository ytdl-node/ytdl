import axios from 'axios';
import cheerio from 'cheerio';
import { URLSearchParams } from 'url';

/**
 * Get first link from list of videos obtained by searching `name` on YouTube.
 * @param name Stores name of video
 */
export default async function getLinkFromName(name: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('search_query', name);
    const searchURL = `https://www.youtube.com/results?${searchParams.toString()}`;

    const searchPage = await axios.get(searchURL);
    const $ = cheerio.load(searchPage.data);
    const firstWatchLink = $('.yt-uix-tile-link').attr('href');
    return `https://youtube.com${firstWatchLink}`;
}
