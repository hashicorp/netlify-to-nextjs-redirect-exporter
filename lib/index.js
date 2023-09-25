/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dissectRule = exports.parseNetlifyRedirects = void 0;
function parseNetlifyRedirects(redirectsSource) {
    return redirectsSource
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter(nonCommentedLines)
        .map(dissectRule)
        .filter(isNetlifyRule)
        .map(handleWildcardRules)
        .reduce(constructRedirectsAndRewrites, { rewrites: [], redirects: [] });
}
exports.parseNetlifyRedirects = parseNetlifyRedirects;
function nonCommentedLines(line) {
    return !line.startsWith("#");
}
function dissectRule(rule) {
    const parts = rule
        .replace(/\s+/g, " ")
        .split(" ")
        .map((x) => x.trim());
    if (parts.length < 2)
        return null;
    const [source, destination, statusCode] = parts;
    // Ignore any non-relative `source` values
    if (!source.startsWith("/"))
        return null;
    // Ignore 4xx status code rules
    if (parseInt(statusCode, 10) >= 400)
        return null;
    return {
        source,
        destination,
        statusCode: statusCode ? parseInt(statusCode, 10) : 301,
    };
}
exports.dissectRule = dissectRule;
function isNetlifyRule(value) {
    return value !== null;
}
function handleWildcardRules(rule) {
    return {
        ...rule,
        source: rule.source.replace(/\/\*$/, "/:splat*"),
        destination: rule.destination.replace(/\/:splat$/, "/:splat*"),
    };
}
function constructRedirectsAndRewrites(acc, rule) {
    return {
        rewrites: rule.statusCode === 200
            ? [
                ...acc.rewrites,
                { source: rule.source, destination: rule.destination },
            ]
            : acc.rewrites,
        redirects: rule.statusCode !== 200
            ? [
                ...acc.redirects,
                {
                    source: rule.source,
                    destination: rule.destination,
                    permanent: true,
                },
            ]
            : acc.redirects,
    };
}
