![C/I](https://github.com/hashicorp/netlify-to-nextjs-redirect-exporter/workflows/C/I/badge.svg)

# netlify-to-nextjs-redirect-exporter

A Node.js library and CLI that converts a Netlify `_redirects` file into compatible Next.js redirect rules

## Installation

```shell
npm i @hashicorp/netlify-to-nextjs-redirect-exporter
```

### Usage

#### Node.js

```ts
// next.config.js
import parseNetlifyRedirects from "@hashicorp/netlify-to-nextjs-redirect-exporter";

const contents = fs.readFileSync("/path/to/_redirects/file");

const { rewrites, redirects } = parseNetlifyRedirects(contents);

module.exports = {
    async rewrites() return rewrites
    async redirects() return redirects
}
```

#### CLI

```shell
$ ./node_modules/.bin/export-netlify-redirects ./_redirects
```

## Active Development

```shell
npm i
npm run watch
```

## Run tests

```shell
npm t
```
