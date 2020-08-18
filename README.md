![C/I](https://github.com/hashicorp/netlify-to-nextjs-redirect-exporter/workflows/C/I/badge.svg)

# netlify-to-nextjs-redirect-exporter

A library to convert a Netlify `_redirects` file into compatible Next.js rules

## Installation

```shell
npm i @hashicorp/netlify-to-nextjs-redirect-exporter
```

**Usage**

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

## Active Development

**Install dependencies**

```shell
npm i
```

```shell
npm run watch
```

## Run tests

```shell
npm t
```
