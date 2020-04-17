# ytdl

**ytdl** provides a library to integrate a Youtube Downloader for `Node.js` projects, and a CLI to download content from [Youtube](https://www.youtube.com).

> Note: You need [ffmpeg](https://ffmpeg.org/download.html) to be installed on your computer for complete functionality. Without it, you won't be able to some formats/qualities of videos.

# Contents

- [Installation](#installation)
  * [Library](#library)
  * [CLI](#cli)
- [API](#api)
- [CLI](#cli-ytdl)

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
./bin/ytdl -h
```

# API

## Example

```javascript
const ytdl = require('@ytdl/ytdl').default; // Alternate: require('@ytdl/ytdl').init;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  await video.download('360p', 'ytdl.mp4');
}

videoDownloader();
```

### OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  video.download('360p', 'ytdl.mp4');
});
```

## Brief

The function `ytdl.init(link: string)` or `ytdl.default(link: string)` returns a Promise which resolves with an object of type `VideoData`.

A VideoData object has the following properties:
- **videoId**: *string*, stores the video ID.
- **videoTitle**: *string*, stores the title of the video.
- **videoTime**: *string*, stores the time of the video.
- **videoDescription**: *string*, stores the description of the video.
- **videoInfo**: *[VideoInfo](./src/models/VideoInfo.ts)*, stores the player_response from YouTube.
- **download(quality, filename[, options])**: *Promise\<void\>*, downloads the video/audio from YouTube.
- **downloadByItag(itag, filename)**: *Promise\<void\>*, downloads from YouTube using the itag property.
- **info()**: *Object*, returns an object consisting of id, title, time, description.

> Any reference to `video` refers to an object returned by `ytdl.default('link')`.

## video.download(quality, path[, options])

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  await video.download('360p', 'ytdl.mp4');
}

videoDownloader();
```

### OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  video.download('360p', 'ytdl.mp4');
});
```

- This function first searches for a stream which has both audio and video in it. If it doesn't find it, it will search for a separate audio and video stream and combine it using ffmpeg.

> Currently **ytdl** uses the [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg) package which requires ffmpeg to be installed on the computer.

### options:
- audioOnly: true | false
- videoOnly: true | false

### audioOnly:

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  await video.download('medium', 'audio.mp3', { audioOnly: true });

  // quality: 'low', 'medium', 'high', 'any'
}

videoDownloader();
```

### videoOnly:

> Note: There will be no sound.

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  await video.download('720p', 'video.mp4', { videoOnly: true });

  // quality: '144p', '360p', '480p', '720p', '1080p'
}

videoDownloader();
```

## video.downloadByItag(url, itag, path)

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  await video.downloadByItag(396, 'ytdl.mp4');
}

videoDownloader();
```

### OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  video.downloadByItag(396, 'ytdl.mp4');
});
```

## video.info()

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoInfo() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  
  const { id, title, time, description } = video.info();
  console.log(`Video Title: ${title}`);
}

videoInfo();
```

### OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  const { id, title, time, description } = video.info();
  console.log(`Video Title: ${title}`);
});
```

## ytdl.fetch(url, path[, headers])

- This function may be used to fetch any data from a website and store it in a file (path).

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.fetch('https://raw.githubusercontent.com/ytdl-node/ytdl/master/README.md', 'ytdl-README.md');
// This returns a promise
// The link could also be an audio/video file.
```

## ytdl.mergeStreams(videoFile, audioFile, outputFile)

- This will add the audio to the video file.

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.mergeStreams('video.mp4', 'audio.mp3', 'output.mp4');
// This returns a Promise.
```

## ytdl.cli()

- This will create a CLI for YTDL.

```javascript
const ytdl = require('@ytdl/ytdl');

ytdl.cli(process.argv);
```

## ytdl.getDownloadLink()

- This will prompt the user to enter a download link (can be used for CLI).

```javascript
const ytdl = require('@ytdl/ytdl');

async function getLinkFromUser() {
  const link = await ytdl.getDownloadLink();
}

getLinkFromUser();
```

# CLI (ytdl)

## Example

```bash
ytdl -d "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" -fn "rhapsody.mp3" -ao
```

## Usage
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

[MIT](./LICENSE)