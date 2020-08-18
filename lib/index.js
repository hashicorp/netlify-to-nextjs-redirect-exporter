"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseNetlifyRedirects(redirectsSource) {
    return redirectsSource
        .split("\n")
        .map((line) => line.trim())
        .filter((result) => result)
        .filter((line) => !line.startsWith("#"))
        .map(dissectRule)
        .filter(isNetlifyRule)
        .map(handleWildcardRules)
        .reduce(constructRedirectsAndRewrites, { rewrites: [], redirects: [] });
}
exports.default = parseNetlifyRedirects;
function isNetlifyRule(value) {
    return value !== null;
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
function dissectRule(rule) {
    const parts = rule
        .replace(/\s+/g, " ")
        .split(" ")
        .map((x) => x.trim());
    if (parts.length < 2)
        return null;
    return {
        source: parts[0],
        destination: parts[1],
        statusCode: parts[2] ? parseInt(parts[2], 10) : 301,
    };
}
function handleWildcardRules(rule) {
    return {
        ...rule,
        source: rule.source.replace(/\/\*$/, "/:splat*"),
        destination: rule.destination.replace(/\/:splat$/, "/:splat*"),
    };
}
