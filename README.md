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

The function `ytdl.init(link: string)` or `ytdl.default(link: string)` returns a Promise which resolves with an object of type `Ytdl`.

A `Ytdl` object has the following properties:
- **info.videoId**: *string*, stores the video ID.
- **info.videoTitle**: *string*, stores the title of the video.
- **info.videoTime**: *string*, stores the time of the video.
- **info.videoDescription**: *string*, stores the description of the video.
- **info.size(quality[, options])**: *Number*, stores the size of the stream in *bytes*.
- **info.all()**: *Object*, returns an object consisting of id, title, time, description.
- **download(quality, filename[, options])**: *Promise\<void\>*, downloads the video/audio from YouTube.
- **setLogLevel(level)**: *void*, allows you to enable or disable logging depending on the level.
- **downloadByItag(itag, filename)**: *Promise\<void\>*, downloads from YouTube using the itag property.
- **stream(quality[, options, headers])**: *Promise\<any\>*, returns a `Node.js` stream.

> Any reference to `video` refers to an object returned by `ytdl.default('link')`.

### options: object
- audioOnly: true | false
- videoOnly: true | false

```javascript
// Example
const options = { audioOnly: true, videoOnly: false };
```

### quality: string
- For audio: low, medium, high, any.
- For video: 144p, 360p, 480p, 720p, 1080p.

```javascript
// Example
const quality = 'low';
```

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

## video.stream(quality[, options, headers])

- This function returns a Node.js stream.
- This may be piped to `fs.createWriteStream(filename)` to save the stream into a file.

> Note: The download function merges separate audio-only and video-only stream when a combined stream is unavailable. This function however will return the appropriate stream if and only if it is available. You may require to pass options, having properties `audioOnly` and `videoOnly` to get the desired stream. E.G. `video.stream('480p', { videoOnly: true })`.

```javascript
const ytdl = require('@ytdl/ytdl').default;
const fs = require('fs');

async function download() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  const stream = await video.stream('360p');
  // The variable stream now holds a Node.js stream.
  // Sample use of stream is as follows:
  stream
    .pipe(fs.createWriteStream('ytdl.mp4'))
    .on('finish', (err) => {
      if (err) console.log(err);
      else console.log('Stream saved successfully.');
    });
}

download();
```

OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;
const fs = require('fs');

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  video.stream('360p').then((stream) => {
    // The variable stream now holds a Node.js stream.
    // Sample use of stream is as follows:
    stream
      .pipe(fs.createWriteStream('ytdl.mp4'))
      .on('finish', (err) => {
        if (err) console.log(err);
        else console.log('Stream saved successfully.');
      });
  });
});
```

## video.setLogLevel(level)

- `level` can be one of the following:
  * error 
  * warn
  * info
  * http
  * verbose
  * debug
  * silly
- A level lower in the list also enables the levels before it.
- E.G., a log level of debug will also enable `verbose, http, info, warn, error`.

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoDownloader() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');

  // This line will enable logging info to console while downloading content.
  video.setLogLevel('info');

  await video.downloadByItag(396, 'ytdl.mp4');
}

videoDownloader();
```

## video.info.size(quality|itag[, options])

- Returns size in bytes.
- A number is treated as an `itag` whereas a string is treated as `quality`.
- Options may be passed only with `quality`, else it will be ignored.

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoSize() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  
  const size = video.info.size('360p'); // can pass options: { audioOnly: boolean, videoOnly: boolean }
  const sizeItag = video.info.size(396);

  console.log(`Video Size for 360p: ${Math.round(size/(1024*1024))}M`);
  console.log(`Video Size for itag = 396: ${Math.round(sizeItag/(1024*1024))}M`);
}

videoSize();
```

### OR

```javascript
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  const size = video.info.size('360p'); // can pass options: { audioOnly: boolean, videoOnly: boolean}
  const sizeItag = video.info.size(396);

  console.log(`Video Size for 360p: ${Math.round(size/(1024*1024))}M`);
  console.log(`Video Size for itag = 396: ${Math.round(sizeItag/(1024*1024))}M`);
});
```

## video.info.all()

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function videoInfo() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  
  const { id, title, time, description } = video.info.all();
  console.log(`Video Title: ${title}`);
}

videoInfo();
```

### OR

```javascript
// Without using async-await.
const ytdl = require('@ytdl/ytdl').default;

ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  const { id, title, time, description } = video.info.all();
  console.log(`Video Title: ${title}`);
});
```

## video.info.fetchFormatData(quality[, options])

- Returns an object: `{ url: string, fmt: object }`.
- `url` holds the download URL for the video.
- `fmt` holds other data about the format such as `contentLength`, `fps`, `mimeType`, etc.
- options are same as in [video.download](#options).

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function getData() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  
  const { url, fmt } = video.info.fetchFormatData('360p');
  console.log(`Download url: ${url}`);
  console.log(`Format data: ${fmt}`);
}

getData();
```

OR

```javascript
ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  const { url, fmt } = video.info.fetchFormatData('360p');
  console.log(`Download url: ${url}`);
  console.log(`Format data: ${fmt}`);
});
```

## video.info.fetchFormatDataByItag(itag)

- Same as `video.info.fetchFormatData(quality)`; except, it fetches data by itag instead of quality.

```javascript
const ytdl = require('@ytdl/ytdl').default;

async function getData() {
  const video = await ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ');
  
  const { url, fmt } = video.info.fetchFormatDataByItag(18);
  console.log(`Download url: ${url}`);
  console.log(`Format data: ${fmt}`);
}

getData();
```

OR

```javascript
ytdl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ').then((video) => {
  const { url, fmt } = video.info.fetchFormatDataByItag(18);
  console.log(`Download url: ${url}`);
  console.log(`Format data: ${fmt}`);
});
```

## ytdl.fetch(url)

- This function may be used to fetch any data from a website and store it in a file (path).

```javascript
const ytdl = require('@ytdl/ytdl');
const fs = require('fs');

const downloader = new ytdl.fetch('https://raw.githubusercontent.com/ytdl-node/ytdl/master/README.md');
async function download() {
  await downloader.download('ytdl-README.md');
  // This returns a promise
  // The link could also be an audio/video file.
}

async function downloadFromStream() {
  const stream = await downloader.stream();
  // This returns a Node.js stream
  // This stream may be utilized in many ways, E.G.:
  stream.pipe(fs.createWriteStream('ytdl-README-from-stream.md'));
}

download();
downloadFromStream();
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
- You can run this by passing arguments.
  * `node file.js -h` OR `npm start -h`

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
ytdl -d -l "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" -fn "rhapsody.mp3" -ao
```

## Usage
```
Usage: ytdl [options]

Options:
  -V, --version               output the version number
  -l, --link <url>            set the url for the YouTube video
  -i, --info                  info about YouTube link
  -d, --download              download from YouTube link
  -fn, --filename <filename>  filename of downloaded content
  -q, --quality <quality>     quality of downloaded content
  -s, --size                  get the size of the video to be downloaded
  -ao, --audio-only           download only audio stream
  -vo, --video-only           download only video stream
  -h, --help                  display help for command
```

# Contributing

Contributing guidelines have been established [here](./CONTRIBUTING.md).

# License

[MIT](./LICENSE)