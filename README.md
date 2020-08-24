![C/I](https://github.com/hashicorp/netlify-to-nextjs-redirect-exporter/workflows/C/I/badge.svg)

# netlify-to-nextjs-redirect-exporter

A Node.js library and CLI that converts a Netlify `_redirects` file into compatible Next.js redirect/rewrite rules

## Installation

```shell
npm i @hashicorp/netlify-to-nextjs-redirect-exporter
```

### Usage

#### Node.js

```ts
// next.config.js
import { parseNetlifyRedirects } from "@hashicorp/netlify-to-nextjs-redirect-exporter";

const contents = fs.readFileSync("/path/to/_redirects/file", "utf8");

// `parseNetlifyRedirects()` will return an object with two keys:
// `rewrites` and `redirects`, each containing an array of corresponding rules
const { rewrites, redirects } = parseNetlifyRedirects(contents);

module.exports = {
    async rewrites() return rewrites
    async redirects() return redirects
}
```

#### CLI

Using the `export-netlify-redirects` CLI will create two files: `rewrites.next.js` and `redirects.next.js`,
each containing an array of corresponding rules.

```shell
$ ./node_modules/.bin/export-netlify-redirects ./_redirects

Writing redirects file to redirects.next.js...
Writing rewrites file to rewrites.next.js...
Done.
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
