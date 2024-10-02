import { describe, expect, it } from 'vitest';
import { Effect, Either, Exit, Option } from 'effect';
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
} from './_fixtures/tokens';

import { parseJSONTokenTree } from '../src/parser/parseJSONTokenTree';

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

  it('should capture circular dependency of length 0', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    expect(
      JSON.parse(
        JSON.stringify(
          Either.getOrThrow(parseJSONTokenTree(tokens)).tokenErrors,
        ),
      ),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message: 'Circular reference detected: color.blue -> color.blue.',
      },
    ]);
  });
  it('should capture circular dependency of length 1', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    expect(
      JSON.parse(
        JSON.stringify(
          Either.getOrThrow(parseJSONTokenTree(tokens)).tokenErrors,
        ),
      ),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
    ]);
  });
  it('should capture circular dependency of length 2', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.indigo}',
        },
        indigo: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    expect(
      JSON.parse(
        JSON.stringify(
          Either.getOrThrow(parseJSONTokenTree(tokens)).tokenErrors,
        ),
      ),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.indigo -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'indigo'],
        message:
          'Circular reference detected: color.cyan -> color.indigo -> color.blue -> color.cyan.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'indigo'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.indigo -> color.blue -> color.cyan -> color.indigo.',
      },
    ]);
  });

  it('should capture invalid type reference - explicitly defined', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          $value: '{color.blue}',
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(analyzedTokens).toHaveLength(1);
    expect(analyzedTokens[0].stringPath).toBe('color.blue');
  });
  it('should capture invalid type reference in composite token - explicitly defined', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            width: '{color.blue}',
            style: 'solid',
            color: '#000000',
          },
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['border', 'base'],
        nodeKey: '$value',
        valuePath: ['width'],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(analyzedTokens).toHaveLength(1);
    expect(analyzedTokens[0].stringPath).toBe('color.blue');
  });
  it('should capture invalid type reference - parent based', () => {
    const tokens: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#0000ff',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          $value: '{color.blue}',
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(analyzedTokens).toHaveLength(1);
    expect(analyzedTokens[0].stringPath).toBe('color.blue');
  });

  it('should keep the token referencing a token pointing to an invalid type', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          // Raw value
          $value: '#0d3181',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          // Invalid type reference
          $value: '{color.blue}',
        },
        alt: {
          $type: 'dimension',
          // Valid type reference
          $value: '{space.base}',
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(analyzedTokens).toHaveLength(2);
    expect(analyzedTokens.map((r) => r.stringPath)).toStrictEqual([
      'color.blue',
      'space.alt',
    ]);
  });
  it('should keep the token referencing a circular references loop', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.blue}',
        },
        indigo: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            width: '4px',
            style: 'solid',
            color: '{color.blue}',
          },
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(tokenErrors).toHaveLength(2);
    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
    ]);

    expect(analyzedTokens).toHaveLength(2);
    expect(analyzedTokens.map((r) => r.stringPath)).toStrictEqual([
      'color.indigo',
      'border.base',
    ]);
  });

  it('should remove the errored tokens while keeping the valid ones', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          // Circular reference
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          // Circular reference
          $value: '{color.blue}',
        },
        indigo: {
          $type: 'color',
          // Non circular reference
          $value: '{color.blue}',
        },
        deepBlue: {
          $type: 'color',
          // Raw value
          $value: '#0d3181',
        },
        green: {
          $type: 'color',
          // Unlinked reference
          $value: '{color.jade}',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          // Invalid type reference
          $value: '{color.deepBlue}',
        },
        alt: {
          $type: 'dimension',
          // Valid type reference
          $value: '{space.base}',
        },
      },
    };

    const { tokenErrors, analyzedTokens } = Either.getOrThrow(
      parseJSONTokenTree(tokens),
    );

    expect(tokenErrors).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(tokenErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'deepBlue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(analyzedTokens).toHaveLength(4);
    expect(analyzedTokens.map((r) => r.stringPath)).toStrictEqual([
      'color.indigo',
      'color.deepBlue',
      'color.green',
      'space.alt',
    ]);
  });
});
