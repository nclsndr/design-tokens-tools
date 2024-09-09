import { describe, it, expect } from 'vitest';

import { findAnalyzedTokenByPath } from '../../../src/parser/token/findAnalyzedTokenByPath';
import { JSONTokenTree } from 'design-tokens-format-module';
import { parseJSONTokenTree } from '../../../src/parser/parseJSONTokenTree';

describe.concurrent('findAnalyzedTokenByPath', () => {
  it('returns Some when token with matching path is found', () => {
    const tokens: JSONTokenTree = {
      color: {
        100: {
          $type: 'color',
          $value: '#000000',
        },
      },
    };
    const analyzedTokens = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => {
        const [analyzedTokens] = tokens;
        return analyzedTokens;
      },
      Error: (e) => {
        throw e;
      },
    });
    const result = findAnalyzedTokenByPath(analyzedTokens, ['color', '100']);

    if (!result.isSome()) throw new Error('Expected Some, got None');

    expect(result.value.path).toStrictEqual(['color', '100']);
  });
  it('returns Some when token with matching stringPath is found', () => {
    const tokens: JSONTokenTree = {
      color: {
        100: {
          $type: 'color',
          $value: '#000000',
        },
      },
    };
    const analyzedTokens = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => {
        const [analyzedTokens] = tokens;
        return analyzedTokens;
      },
      Error: (e) => {
        throw e;
      },
    });
    const result = findAnalyzedTokenByPath(analyzedTokens, 'color.100');

    if (!result.isSome()) throw new Error('Expected Some, got None');

    expect(result.value.path).toStrictEqual(['color', '100']);
  });
  it('returns None when token with matching path is not found', () => {
    const tokens: JSONTokenTree = {
      color: {
        100: {
          $type: 'color',
          $value: '#000000',
        },
      },
    };
    const analyzedTokens = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => {
        const [analyzedTokens] = tokens;
        return analyzedTokens;
      },
      Error: (e) => {
        throw e;
      },
    });
    const result = findAnalyzedTokenByPath(analyzedTokens, ['color', '200']);

    expect(result.isNone()).toBe(true);
  });
});
