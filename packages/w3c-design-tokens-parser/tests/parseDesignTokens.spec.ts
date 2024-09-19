import { describe, it, expect } from 'vitest';

import { parseDesignTokens } from '../src/parseDesignTokens.js';
import { JSONTokenTree } from 'design-tokens-format-module';
import { TokenTree } from '../src/client/TokenTree';

describe('parseDesignTokens', () => {
  it('should parse a token tree and return a TokenTree instance', () => {
    const tokens: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#0000FF',
        },
        accent: {
          $value: '{color.blue}',
        },
        borderActive: {
          $value: '{color.accent}',
        },
      },
      border: {
        $type: 'border',
        active: {
          $value: {
            width: '1px',
            style: 'solid',
            color: '{color.borderActive}',
          },
        },
      },
    };
    const tokenTree = parseDesignTokens(tokens);

    expect(tokenTree instanceof TokenTree).toBe(true);
  });
});
