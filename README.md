# ytdl

A CLI written in javascript/typescript, which allows you to download videos from [YouTube](https://youtube.com) onto your system.

# Installation

## Via curl

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ytdl-node/ytdl/master/bin/install)"
```

## Via wget

```bash
sh -c "$(wget -O- https://raw.githubusercontent.com/ytdl-node/ytdl/master/bin/install)"
```

## Via commands

```bash
git clone https://github.com/ytdl-node/ytdl.git
cd ytdl
npm install
npm run pack
./bin/ytdl -h
```

# Usage

> `ytdl` is not fully functional yet, the download function works only for certain videos.

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