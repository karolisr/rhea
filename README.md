# CDSDB

## Setup for Development

1. Install `node`. One way to do this is to get [`nvm`](https://github.com/nvm-sh/nvm) then run:

```bash
nvm install node
```

1. Install [`rust`](https://www.rust-lang.org/tools/install)
2. Install build dependencies. On Ubuntu:

```bash
sudo apt update
sudo apt install \
  libssl-dev \
  libglib2.0-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libwebkit2gtk-4.1-dev
```

## Project Setup

Run the following commands from within the root directory of the repository.

```bash
npm install
```

## Developing

```bash
npm run tauri dev
```

## Building

```bash
npm run tauri build
```
