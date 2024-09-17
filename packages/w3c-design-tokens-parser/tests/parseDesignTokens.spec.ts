import { describe, it, expect } from 'vitest';

import { parseDesignTokens } from '../src/parseDesignTokens.js';
import { JSONTokenTree } from 'design-tokens-format-module';

describe('parseDesignTokens', () => {
  it.todo('should parse a JSON token tree', () => {
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

    const colorValues = tokenTree.mapTokensByType('color', (colorToken) => {
      return colorToken
        .getValueMapper()
        .mapScalarValue((scalarValue) => scalarValue.raw)
        .mapAliasReference(
          (aliasReference) =>
            `var(--${aliasReference.to.treePath.array.join('-')})`,
        )
        .unwrap();
    });
    console.log(colorValues); // [ '#0000FF', 'var(--color-blue)', 'var(--color-accent)' ]

    const fullyResolvedColorValues = tokenTree.mapTokensByType(
      'color',
      (token) => {
        return token.getJSONValue({
          resolveToDepth: Infinity,
          // resolveToDepth allows to resolve the token value to a certain depth.
          // resolveToDepth: -1 is equivalent to resolveToDepth: Infinity
        });
      },
    );

    fullyResolvedColorValues; // [ '#0000FF', '#0000FF', '#0000FF' ]

    const partiallyResolvedColorValues = tokenTree.mapTokensByType(
      'color',
      (token) => {
        return token.getJSONValue({
          resolveToDepth: 1,
        });
      },
    );

    partiallyResolvedColorValues; // [ '#0000FF', '#0000FF', '{color.blue}' ]

    const borderValues = tokenTree.mapTokensByType('border', (token) => {
      return token
        .getValueMapper()
        .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')})`)
        .mapObjectValue((obj) =>
          obj.flatMap((value) => {
            const width = value.width
              .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
              .mapScalarValue((value) => value.raw)
              .unwrap();
            const style = value.style
              .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
              .mapScalarValue((value) => value.raw)
              .unwrap();
            const color = value.color
              .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
              .mapScalarValue((value) => value.raw)
              .unwrap();

            return [width, style, color].join(' ');
          }),
        )
        .unwrap();
    });

    console.log(borderValues); // [ '1px solid var(--color-borderActive' ]
  });
});
