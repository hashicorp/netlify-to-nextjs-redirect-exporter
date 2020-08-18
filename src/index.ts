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

export default function parseNetlifyRedirects(
  redirectsSource: string
): NextjsRules {
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

function isNetlifyRule(
  value: ParsedNetlifyRule | null
): value is ParsedNetlifyRule {
  return (value as ParsedNetlifyRule) !== null;
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

function dissectRule(rule: string): ParsedNetlifyRule | null {
  const parts = rule
    .replace(/\s+/g, " ")
    .split(" ")
    .map((x) => x.trim());

  if (parts.length < 2) return null;

  return {
    source: parts[0],
    destination: parts[1],
    statusCode: parts[2] ? parseInt(parts[2], 10) : 301,
  };
}

function handleWildcardRules(rule: ParsedNetlifyRule): ParsedNetlifyRule {
  return {
    ...rule,
    source: rule.source.replace(/\/\*$/, "/:splat*"),
    destination: rule.destination.replace(/\/:splat$/, "/:splat*"),
  };
}
