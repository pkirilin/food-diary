import browserslist from 'browserslist';

import packageJson from './package.json' with { type: 'json' };

const BUNDLER_BROWSER_NAMES: Record<string, string> = {
  chrome: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  ios_saf: 'ios',
  opera: 'opera',
  safari: 'safari',
};

const parseVersion = (version: string): number | null => {
  const parsed = Number.parseFloat(version);

  return Number.isNaN(parsed) ? null : parsed;
};

export const toBuildTargets = (browsers: string[]): string[] => {
  const oldestByBrowser = new Map<string, { label: string; value: number }>();

  for (const browser of browsers) {
    const [family, version = ''] = browser.split(' ');
    const bundlerName = BUNDLER_BROWSER_NAMES[family];
    const lowerBound = version.split('-')[0];
    const value = parseVersion(lowerBound);

    if (bundlerName === undefined || value === null) {
      continue;
    }

    const oldest = oldestByBrowser.get(bundlerName);

    if (oldest === undefined || value < oldest.value) {
      oldestByBrowser.set(bundlerName, { label: lowerBound, value });
    }
  }

  return [...oldestByBrowser]
    .map(([bundlerName, { label }]) => `${bundlerName}${label}`)
    .sort((a, b) => a.localeCompare(b));
};

export const resolveBuildTargets = (env: keyof typeof packageJson.browserslist): string[] =>
  toBuildTargets(browserslist(packageJson.browserslist[env]));
