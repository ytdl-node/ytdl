# ytdl

**ytdl** provides a library to integrate a Youtube Downloader for `Node.js` projects, and a CLI to download content from [Youtube](https://www.youtube.com).

# Installation

## Library

### Via npm

```bash
npm install @ytdl/ytdl
```

## CLI

### Via npm

```bash
npm install @ytdl/ytdl -g
```

### Via curl

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ytdl-node/ytdl/master/bin/install)"
```

### Via wget

```bash
sh -c "$(wget -O- https://raw.githubusercontent.com/ytdl-node/ytdl/master/bin/install)"
```

### Via commands

```bash
git clone https://github.com/ytdl-node/ytdl.git
cd ytdl
npm install
npm run pack
./bin/ytdl -h
```

# Usage

# Library / API

> Note: Currently ytdl saves files in `./data`, i.e., a directory named data in the current directory. If `./data` does not exist, ytdl will throw an error (to be fixed soon).

## Example

```javascript
const ytdl = require('@ytdl/ytdl').default;
ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '480p', 'ytdl.mp4');
```

### OR

```javascript
const ytdl = require('@ytdl/ytdl');
ytdl.ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '480p', 'ytdl.mp4');
```

## ytdl.ytdl(url, quality, path[, options])

> Note: `ytdl.ytdl(...)` is also the default export (`ytdl.default(...)`).

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '720p', 'video.mp4');
```

- This function first searches for a stream which has both audio and video in it. If it doesn't find it, it will search for a separate audio and video stream and combine it using ffmpeg.

> Currently **ytdl** uses the [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg) package which requires ffmpeg to be installed on the computer.

options:
  - audioOnly: true | false
  - videoOnly: true | false

### audioOnly (Download only audio stream)

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', 'medium', 'audio.mp3', { audioOnly: true });

// quality: 'low', 'medium', 'high', 'any'
```

### videoOnly (Download only video stream)

> Note: There will be no sound in the video.

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', '360p', 'video.mp4', { audioOnly: true });

// quality: '144p', '360p', '480p', '720p', '1080p'
```

## ytdl.downloadByItag(url, itag, path)

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.downloadByItag('https://www.youtube.com/watch?v=fJ9rUzIMcZQ', 396, 'video.mp4');
```

## ytdl.info(link)

```javascript
const ytdl = require('@ytdl/ytdl');

async function getInfo (link) {
  const {
    videoDescription,
    videoId,
    videoTime,
    videoTitle,
    videoInfo,
  } = await ytdl.info(link);

  // To log the time
  console.log(`Video time is: ${videoTime}`); 

}

getInfo('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
```

- This may be written without using async-await:

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.info('https://www.youtube.com/watch?v=fJ9rUzIMcZQ')
  .then((info) => {
    const {
      videoDescription,
      videoId,
      videoTime,
      videoTitle,
      videoInfo,
    } = info;

    // To log the time
    console.log(`Video time is: ${videoTime}`); 
  });
```

# CLI

```
Usage: ytdl [options]

Options:
  -V, --version               output the version number
  -i, --info <url>            info about YouTube link
  -d, --download <url>        download from YouTube link
  -fn, --filename <filename>  filename of downloaded content
  -q, --quality <quality>     quality of downloaded content
  -dj, --dump-json <url>      dump json into file
  -ao, --audio-only           download only audio stream
  -vo, --video-only           download only video stream
  -h, --help                  display help for command
```

# Contributing

Contributing guidelines have been established [here](./CONTRIBUTING.md).

# License

[MIT](https://github.com/ytdl-node/ytdl/blob/master/LICENSE)