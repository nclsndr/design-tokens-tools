import { describe, expect, it } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { parseJSONTokenTree } from '../../src/parser/parseJSONTokenTree';
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

describe('parseJSONTokenTree', () => {
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

    const analyzedResult = parseJSONTokenTree(tree).match({
      Ok: (result) => result,
      Error: (errors) => {
        throw new Error(errors.map((e) => e.message).join('\n'));
      },
    });

    expect(analyzedResult).toMatchSnapshot();
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

    const analyzedResult = parseJSONTokenTree(tree).match({
      Ok: (result) => result,
      Error: (errors) => {
        throw new Error(errors.map((e) => e.message).join('\n'));
      },
    });

    expect(JSON.parse(JSON.stringify(analyzedResult))).toStrictEqual({
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
      tokens: [
        [
          {
            path: ['base', 'primary'],
            type: 'color',
            value: {
              raw: '#a82222',
              toReferences: [],
            },
          },
          {
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
        [],
      ],
      groups: [
        [
          {
            path: [],
            childrenCount: 2,
          },
          {
            path: ['base'],
            childrenCount: 1,
          },
          {
            path: ['semantic'],
            childrenCount: 1,
          },
        ],
        [],
      ],
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

    const analyzedResult = parseJSONTokenTree(tree).match({
      Ok: (result) => result,
      Error: (errors) => {
        throw new Error(errors.map((e) => e.message).join('\n'));
      },
    });

    expect(JSON.parse(JSON.stringify(analyzedResult))).toStrictEqual({
      tokenTree: {
        base: { primary: { $type: 'color', $value: 'rgba(0, 0, 0, 0.5)' } },
        semantic: { primary: { $type: 'unknown', $value: 'some value' } },
        invalidGroup: { $description: 42 },
      },
      tokens: [
        [],
        [
          {
            type: 'Value',
            isCritical: false,
            treePath: ['base', 'primary'],
            nodeKey: '$value',
            valuePath: [],
            message:
              'base.primary.$value must start with "#" and have a length of 6 or 8. Got: "rgba(0, 0, 0, 0.5)".',
          },
          {
            type: 'Value',
            isCritical: false,
            treePath: ['semantic', 'primary'],
            nodeKey: '$type',
            valuePath: [],
            message:
              'semantic.primary.$type must be a valid type among: "number", "string", "color", "dimension", "duration", "fontFamily", "fontWeight", "cubicBezier", "border", "strokeStyle", "transition", "shadow", "gradient", "typography". Got "unknown".',
          },
        ],
      ],
      groups: [
        [
          { path: [], childrenCount: 3 },
          { path: ['base'], childrenCount: 1 },
          { path: ['semantic'], childrenCount: 1 },
        ],
        [
          {
            type: 'Type',
            isCritical: false,
            treePath: ['invalidGroup'],
            nodeKey: '$description',
            valuePath: [],
            message:
              'invalidGroup.$description must be a string. Got "number".',
          },
        ],
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

    const analyzedResult = parseJSONTokenTree(tree).match({
      Ok: (result) => result,
      Error: (errors) => {
        throw new Error(errors.map((e) => e.message).join('\n'));
      },
    });

    expect(JSON.parse(JSON.stringify(analyzedResult))).toStrictEqual({
      tokenTree: {
        base: { $type: 'color', primary: { $value: '{base.primary}' } },
      },
      tokens: [
        [],
        [
          {
            isCritical: false,
            message: 'Circular references detected.',
            referenceToTreePath: ['base', 'primary'],
            type: 'Computation',
            treePath: ['base', 'primary'],
            valuePath: [],
          },
        ],
      ],
      groups: [
        [
          { path: [], childrenCount: 1 },
          { path: ['base'], tokenType: 'color', childrenCount: 1 },
        ],
        [],
      ],
    });
  });
});
