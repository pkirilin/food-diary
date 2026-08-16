import { describe, expect, test } from 'vitest';

import { resolveBuildTargets, toBuildTargets } from './buildTargets';

describe('toBuildTargets', () => {
  test('should keep the oldest version of each browser family', () => {
    const targets = toBuildTargets(['chrome 151', 'chrome 118', 'chrome 117', 'firefox 121']);

    expect(targets).toStrictEqual<string[]>(['chrome117', 'firefox121']);
  });

  test('should use the lower bound of a version range', () => {
    const targets = toBuildTargets(['ios_saf 18.5-18.7', 'ios_saf 17.6-17.7']);

    expect(targets).toStrictEqual<string[]>(['ios17.6']);
  });

  test('should rename browserslist families to the names the bundler expects', () => {
    const targets = toBuildTargets(['ios_saf 17.0', 'safari 17.0', 'edge 121']);

    expect(targets).toStrictEqual<string[]>(['edge121', 'ios17.0', 'safari17.0']);
  });

  test('should drop browsers the bundler cannot target', () => {
    const targets = toBuildTargets(['chrome 117', 'op_mini all', 'and_qq 14.9', 'safari TP']);

    expect(targets).toStrictEqual<string[]>(['chrome117']);
  });
});

describe('resolveBuildTargets', () => {
  test('should read the production browser list declared by the project', () => {
    const targets = resolveBuildTargets('production');

    expect(targets).toStrictEqual<string[]>([
      'chrome117',
      'edge121',
      'firefox121',
      'ios17.0',
      'safari17.0',
    ]);
  });
});
