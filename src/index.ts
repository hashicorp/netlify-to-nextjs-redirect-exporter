/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

type ParsedNetlifyRule = {
  source: string;
  destination: string;
  statusCode: number;
};

type RedirectRule = {
  source: string;
  destination: string;
  permanent: boolean;
  basePath?: boolean;
};

type RewriteRule = {
  source: string;
  destination: string;
  basePath?: boolean;
};

type NextjsRules = {
  rewrites: RewriteRule[];
  redirects: RedirectRule[];
};

export function parseNetlifyRedirects(redirectsSource: string): NextjsRules {
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

function nonCommentedLines(line: string): boolean {
  return !line.startsWith("#");
}

export function dissectRule(rule: string): ParsedNetlifyRule | null {
  const parts = rule
    .replace(/\s+/g, " ")
    .split(" ")
    .map((x) => x.trim());

  if (parts.length < 2) return null;

  const [source, destination, statusCode] = parts;

  // Ignore any non-relative `source` values
  if (!source.startsWith("/")) return null;

  // Ignore 4xx status code rules
  if (parseInt(statusCode, 10) >= 400) return null;

  return {
    source,
    destination,
    statusCode: statusCode ? parseInt(statusCode, 10) : 301,
  };
}

function isNetlifyRule(
  value: ParsedNetlifyRule | null
): value is ParsedNetlifyRule {
  return (value as ParsedNetlifyRule) !== null;
}

function handleWildcardRules(rule: ParsedNetlifyRule): ParsedNetlifyRule {
  return {
    ...rule,
    source: rule.source.replace(/\/\*$/, "/:splat*"),
    destination: rule.destination.replace(/\/:splat$/, "/:splat*"),
  };
}

function constructRedirectsAndRewrites(
  acc: NextjsRules,
  rule: ParsedNetlifyRule
): NextjsRules {
  return {
    rewrites:
      rule.statusCode === 200
        ? [
            ...acc.rewrites,
            { source: rule.source, destination: rule.destination },
          ]
        : acc.rewrites,
    redirects:
      rule.statusCode !== 200
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
