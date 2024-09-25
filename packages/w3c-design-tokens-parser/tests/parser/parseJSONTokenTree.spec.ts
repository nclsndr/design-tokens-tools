import { describe, expect, it } from 'vitest';
import { Either, Option } from 'effect';
import { JSONTokenTree } from 'design-tokens-format-module';

import {
  borderToken,
  colorToken,
  cubicBezierToken,
  dimensionToken,
  durationToken,
  fontFamilyToken,
  gradientToken,
  numberFontWeightToken,
  numberToken,
  shadowToken,
  stringFontWeightToken,
  strokeStyleToken,
  transitionToken,
  typographyToken,
} from '../_fixtures/tokens';

import { parseJSONTokenTree } from '../../src/parser/parseJSONTokenTree';

describe('parseJSONTokenTree', () => {
  it('should parse a token tree embedded in a string', () => {
    const tokens: JSONTokenTree = {
      base: {
        primary: colorToken,
      },
      semantic: {
        primary: {
          $value: '{base.primary}',
        },
      },
    };

    const result = parseJSONTokenTree(JSON.stringify(tokens));

    const matched = Either.getOrThrow(result);

    expect(matched?.analyzedTokens).toHaveLength(2);
    expect(matched?.analyzedGroups).toHaveLength(3);
    expect(matched?.tokenErrors).toStrictEqual([]);
    expect(matched?.groupErrors).toStrictEqual([]);
  });
  it('should parse a token tree of raw values of all types', () => {
    const tree: JSONTokenTree = {
      borderToken,
      colorToken,
      cubicBezierToken,
      dimensionToken,
      durationToken,
      fontFamilyToken,
      stringFontWeightToken,
      numberFontWeightToken,
      gradientToken,
      numberToken,
      shadowToken,
      strokeStyleToken,
      transitionToken,
      typographyToken,
    };

    const result = parseJSONTokenTree(tree);

    const matched = Either.match(result, {
      onRight: (r) => ({
        ...r,
        analyzedTokens: r.analyzedTokens.map((t) => ({
          ...JSON.parse(JSON.stringify(t)),
          id: 'ID',
        })),
      }),
      onLeft: () => undefined,
    });

    expect(matched?.analyzedTokens).toHaveLength(14);
    expect(matched?.analyzedTokens).toMatchSnapshot();
  });
  it('should parse a token tree with $description and $extensions at the root level', () => {
    const tree: JSONTokenTree = {
      $description: 'A description for the token tree.',
      $extensions: {
        someExtension: 'Some value',
      },
      base: {
        primary: colorToken,
      },
    };

    const result = parseJSONTokenTree(tree);

    const matched = JSON.parse(JSON.stringify(Either.getOrThrow(result)));

    expect(matched).toStrictEqual({
      tokenTree: {
        $description: 'A description for the token tree.',
        $extensions: {
          someExtension: 'Some value',
        },
        base: {
          primary: {
            $type: 'color',
            $value: '#a82222',
          },
        },
      },
      analyzedTokens: [
        {
          id: expect.any(String),
          path: ['base', 'primary'],
          type: 'color',
          value: {
            raw: '#a82222',
            toReferences: [],
          },
        },
      ],
      analyzedGroups: [
        {
          id: expect.any(String),
          path: [],
          childrenCount: 1,
          description: 'A description for the token tree.',
          extensions: {
            someExtension: 'Some value',
          },
        },
        {
          id: expect.any(String),
          path: ['base'],
          childrenCount: 1,
        },
      ],
      tokenErrors: [],
      groupErrors: [],
    });
  });
  it('should parse a token tree with a token at the top level', () => {
    const tree: JSONTokenTree = colorToken;

    const result = parseJSONTokenTree(tree);

    const matched = JSON.parse(JSON.stringify(Either.getOrThrow(result)));

    expect(matched).toStrictEqual({
      tokenTree: {
        $type: 'color',
        $value: '#a82222',
      },
      analyzedTokens: [
        {
          id: expect.any(String),
          path: [],
          type: 'color',
          value: {
            raw: '#a82222',
            toReferences: [],
          },
        },
      ],
      analyzedGroups: [],
      tokenErrors: [],
      groupErrors: [],
    });
  });
  it('should parse a token tree with references to other tokens', () => {
    const tree: JSONTokenTree = {
      base: {
        primary: colorToken,
      },
      semantic: {
        primary: {
          $value: '{base.primary}',
        },
      },
    };

    const result = parseJSONTokenTree(tree);

    const matched = JSON.parse(JSON.stringify(Either.getOrThrow(result)));

    expect(matched).toStrictEqual({
      tokenTree: {
        base: {
          primary: {
            $type: 'color',
            $value: '#a82222',
          },
        },
        semantic: {
          primary: {
            $value: '{base.primary}',
          },
        },
      },
      analyzedTokens: [
        {
          id: expect.any(String),
          path: ['base', 'primary'],
          type: 'color',
          value: {
            raw: '#a82222',
            toReferences: [],
          },
        },
        {
          id: expect.any(String),
          path: ['semantic', 'primary'],
          type: 'color',
          value: {
            raw: '{base.primary}',
            toReferences: [
              {
                fromTreePath: ['semantic', 'primary'],
                fromValuePath: [],
                toTreePath: ['base', 'primary'],
              },
            ],
          },
        },
      ],
      analyzedGroups: [
        {
          id: expect.any(String),
          path: [],
          childrenCount: 2,
        },
        {
          id: expect.any(String),
          path: ['base'],
          childrenCount: 1,
        },
        {
          id: expect.any(String),
          path: ['semantic'],
          childrenCount: 1,
        },
      ],
      tokenErrors: [],
      groupErrors: [],
    });
  });
  it('should parse a token tree with invalid tokens', () => {
    const tree: JSONTokenTree = {
      base: {
        // @ts-expect-error
        primary: {
          $type: 'color',
          $value: 'rgba(0, 0, 0, 0.5)',
        },
      },
      semantic: {
        primary: {
          // @ts-expect-error
          $type: 'unknown',
          // @ts-expect-error
          $value: 'some value',
        },
      },
      invalidGroup: {
        // @ts-expect-error
        $description: 42,
      },
    };

    const result = parseJSONTokenTree(tree);

    const matched = JSON.parse(JSON.stringify(Either.getOrThrow(result)));

    expect(matched).toStrictEqual({
      tokenTree: {
        base: { primary: { $type: 'color', $value: 'rgba(0, 0, 0, 0.5)' } },
        semantic: { primary: { $type: 'unknown', $value: 'some value' } },
        invalidGroup: { $description: 42 },
      },
      analyzedTokens: [],
      analyzedGroups: [
        { id: expect.any(String), path: [], childrenCount: 3 },
        { id: expect.any(String), path: ['base'], childrenCount: 1 },
        { id: expect.any(String), path: ['semantic'], childrenCount: 1 },
      ],
      tokenErrors: [
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['base', 'primary'],
          nodeKey: '$value',
          valuePath: [],
          message:
            'base.primary.$value must start with "#" and have a length of 6 or 8. Got: "rgba(0, 0, 0, 0.5)".',
        },
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['semantic', 'primary'],
          nodeKey: '$type',
          valuePath: [],
          message:
            'semantic.primary.$type must be a valid type among: "color", "dimension", "fontFamily", "fontWeight", "duration", "cubicBezier", "number", "strokeStyle", "border", "transition", "shadow", "gradient", "typography". Got "unknown".',
        },
      ],
      groupErrors: [
        {
          type: 'Type',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['invalidGroup'],
          nodeKey: '$description',
          valuePath: [],
          message: 'invalidGroup.$description must be a string. Got "number".',
        },
      ],
    });
  });
  it('should parse a token tree containing a circular reference', () => {
    const tree: JSONTokenTree = {
      base: {
        $type: 'color',
        primary: {
          $value: '{base.primary}',
        },
      },
    };

    const result = parseJSONTokenTree(tree);

    const matched = JSON.parse(JSON.stringify(Either.getOrThrow(result)));

    expect(matched).toStrictEqual({
      tokenTree: {
        base: { $type: 'color', primary: { $value: '{base.primary}' } },
      },
      analyzedTokens: [],
      analyzedGroups: [
        { id: expect.any(String), path: [], childrenCount: 1 },
        {
          id: expect.any(String),
          path: ['base'],
          tokenType: 'color',
          childrenCount: 1,
        },
      ],
      tokenErrors: [
        {
          isCritical: false,
          message:
            'Circular references detected while resolving token type for token "base.primary".',
          referenceToTreePath: ['base', 'primary'],
          type: 'Computation',
          nodeId: '',
          treePath: ['base', 'primary'],
          valuePath: [],
        },
      ],
      groupErrors: [],
    });
  });
});
