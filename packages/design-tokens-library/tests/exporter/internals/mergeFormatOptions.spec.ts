import { describe, expect, it } from 'vitest';

import { FormatOptions } from '../../../src/exporter/internals/FormatOptions.js';

import { mergeFormatOptions } from '../../../src/exporter/internals/mergeFormatOptions.js';

describe.concurrent('mergeFormatOptions', () => {
  it('merges two defined FormatOptions objects', () => {
    const origin: FormatOptions = {
      token: {
        name: { toCase: 'camelCase', joinWith: '-', template: 'origin' },
        value: { resolveAtDepth: 2 },
      },
    };
    const target: FormatOptions = {
      token: {
        name: { toCase: 'snakeCase', joinWith: '_', template: 'target' },
        value: { resolveAtDepth: 'infinity' },
      },
    };
    const result = mergeFormatOptions(origin, target);
    expect(result).toEqual({
      token: {
        name: { toCase: 'snakeCase', joinWith: '_', template: 'target' },
        value: { resolveAtDepth: 'infinity' },
      },
    });
  });
  it('returns target when origin is undefined', () => {
    const target: FormatOptions = {
      token: {
        name: { toCase: 'snakeCase', joinWith: '_', template: 'target' },
        value: { resolveAtDepth: 'infinity' },
      },
    };
    const result = mergeFormatOptions(undefined, target);
    expect(result).toEqual(target);
  });
  it('returns origin when target is undefined', () => {
    const origin: FormatOptions = {
      token: {
        name: { toCase: 'camelCase', joinWith: '-', template: 'origin' },
        value: { resolveAtDepth: 2 },
      },
    };
    const result = mergeFormatOptions(origin, undefined);
    expect(result).toEqual(origin);
  });
  it('returns an empty object when both origin and target are undefined', () => {
    const result = mergeFormatOptions(undefined, undefined);
    expect(result).toEqual({ token: { name: {}, value: {} } });
  });
  it('overrides nested properties correctly', () => {
    const origin: FormatOptions = {
      token: {
        name: { toCase: 'camelCase', joinWith: '-', template: 'origin' },
        value: { resolveAtDepth: 2 },
      },
    };
    const target: FormatOptions = {
      token: {
        name: { toCase: 'snakeCase', joinWith: '_', template: 'target' },
        value: { resolveAtDepth: 'infinity' },
      },
    };
    const result = mergeFormatOptions(origin, target);
    expect(result).toEqual({
      token: {
        name: { toCase: 'snakeCase', joinWith: '_', template: 'target' },
        value: { resolveAtDepth: 'infinity' },
      },
    });
  });
});
