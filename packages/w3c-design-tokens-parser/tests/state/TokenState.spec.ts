import { describe, it, expect } from 'vitest';
import { Option } from 'effect';
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
import { buildTreeState } from '../../src/state/buildTreeState';

describe('TokenState', () => {
  describe('getJSONToken', () => {
    it('should parse a token tree of raw values of all types', () => {
      const tokens: JSONTokenTree = {
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

      const treeState = buildTreeState(tokens);

      const values = treeState.tokenStates.map((t) => t.getJSONToken());

      expect(values).toStrictEqual([
        {
          $type: 'border',
          $value: { color: '#676767', width: '1px', style: 'solid' },
        },
        { $type: 'color', $value: '#a82222' },
        { $type: 'cubicBezier', $value: [0, 1, 1, 0] },
        { $type: 'dimension', $value: '12px' },
        { $type: 'duration', $value: '1ms' },
        { $type: 'fontFamily', $value: 'Arial' },
        { $type: 'fontWeight', $value: 'bold' },
        { $type: 'fontWeight', $value: 700 },
        {
          $type: 'gradient',
          $value: [
            {
              color: '#000000',
              position: 0,
            },
            {
              color: '#ffffff',
              position: 1,
            },
          ],
        },
        { $type: 'number', $value: 12 },
        {
          $type: 'shadow',
          $value: {
            color: '#000000',
            offsetX: '1px',
            offsetY: '2px',
            blur: '3px',
            spread: '4px',
          },
        },
        { $type: 'strokeStyle', $value: 'solid' },
        {
          $type: 'transition',
          $value: {
            duration: '100ms',
            delay: '0ms',
            timingFunction: [0, 0.1, 0.7, 0.5],
          },
        },
        {
          $type: 'typography',
          $value: {
            fontFamily: 'Arial',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            lineHeight: 1.5,
          },
        },
      ]);
    });

    it('should parse a token tree of alias values', () => {
      const tokens: JSONTokenTree = {
        borderToken,
        dimensionToken,
        colorToken,
        gradientToken,
        cubicBezierToken,
        aliasedBorder: {
          $type: 'border',
          $value: '{borderToken}',
        },
        deepAliasedBorder: {
          $type: 'border',
          $value: {
            color: '{colorToken}',
            width: '{dimensionToken}',
            style: 'solid',
          },
        },
        aliasedDimension: {
          $type: 'dimension',
          $value: '{dimensionToken}',
        },
        aliasedGradient: {
          $type: 'gradient',
          $value: '{gradientToken}',
        },
        deepAliasedGradient: {
          $type: 'gradient',
          $value: [
            {
              color: '{colorToken}',
              position: 0,
            },
            {
              color: '{colorToken}',
              position: 1,
            },
          ],
        },
        aliasedCubicBezier: {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
      };

      const treeState = buildTreeState(tokens);

      const values = treeState.tokenStates.map((t) => t.getJSONToken());

      expect(values).toStrictEqual([
        {
          $type: 'border',
          $value: {
            color: '#676767',
            width: '1px',
            style: 'solid',
          },
        },
        {
          $type: 'dimension',
          $value: '12px',
        },
        {
          $type: 'color',
          $value: '#a82222',
        },
        {
          $type: 'gradient',
          $value: [
            {
              color: '#000000',
              position: 0,
            },
            {
              color: '#ffffff',
              position: 1,
            },
          ],
        },
        {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
        {
          $type: 'border',
          $value: '{borderToken}',
        },
        {
          $type: 'border',
          $value: {
            color: '{colorToken}',
            width: '{dimensionToken}',
            style: 'solid',
          },
        },
        {
          $type: 'dimension',
          $value: '{dimensionToken}',
        },
        {
          $type: 'gradient',
          $value: '{gradientToken}',
        },
        {
          $type: 'gradient',
          $value: [
            {
              color: '{colorToken}',
              position: 0,
            },
            {
              color: '{colorToken}',
              position: 1,
            },
          ],
        },
        {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
      ]);
    });
  });
  describe('getValueMapper', () => {
    it('should get the ValueMapper utility to work with the token value', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
        },
        dimension: {
          $type: 'dimension',
          $value: '4px',
        },
        strokeStyle: {
          $type: 'strokeStyle',
          $value: {
            dashArray: ['2px', '{dimension}'],
            lineCap: 'round',
          },
        },
        border: {
          $type: 'border',
          $value: {
            color: '{color.blue}',
            style: '{strokeStyle}',
            width: '3px',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const blueToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'blue']),
      );
      const valueMapper = blueToken?.getValueMapper();

      expect(valueMapper?.toString()).toBe(`ValueMapper for "color.blue" {
  Scalar: #cfd5e6
}`);

      const strokeStyleToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('strokeStyle', ['strokeStyle']),
      );
      const valueMapperStrokeStyle = strokeStyleToken?.getValueMapper();

      expect(valueMapperStrokeStyle?.toString())
        .toBe(`ValueMapper for "strokeStyle" {
  ObjectValue: {
    dashArray: ValueMapper for "strokeStyle" {
      ArrayValue: [
        0: ValueMapper for "strokeStyle" {
          Scalar: 2px
        },
        1: ValueMapper for "strokeStyle" {
          AliasReference [Linked] "strokeStyle" at "dashArray.1" -> "dimension"
        }
      ]
    },
    lineCap: ValueMapper for "strokeStyle" {
      Scalar: round
    }
  }
}`);

      const borderToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('border', ['border']),
      );
      const valueMapperBorder = borderToken?.getValueMapper();

      expect(valueMapperBorder?.toString()).toBe(`ValueMapper for "border" {
  ObjectValue: {
    color: ValueMapper for "border" {
      AliasReference [Linked] "border" at "color" -> "color.blue"
    },
    style: ValueMapper for "border" {
      AliasReference [Linked] "border" at "style" -> "strokeStyle"
    },
    width: ValueMapper for "border" {
      Scalar: 3px
    }
  }
}`);
    });

    it('should help iterate over a scalar primitive value', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const blueToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'blue']),
      );

      const result = blueToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath)
        .mapScalarValue((v) => v.raw)
        .unwrap();

      expect(result).toBe('#cfd5e6');
    });
    it('should help iterate over a referenced primitive value', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const cyanToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'cyan']),
      );

      const result = cyanToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapScalarValue((v) => v.raw)
        .unwrap();

      expect(result).toBe('color.blue');
    });
    it('should help iterate over a border composite value while keeping its original shape', () => {
      const tokens: JSONTokenTree = {
        border: {
          $type: 'border',
          $value: {
            color: '#cfd5e6',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const borderToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('border', ['border']),
      );

      const result = borderToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapObjectValue((obj) =>
          obj
            .mapKey('color', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .mapKey('style', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .mapKey('width', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .unwrap(),
        )
        .unwrap();

      expect(result).toStrictEqual({
        color: '#cfd5e6',
        width: '1px',
        style: 'solid',
      });
    });
    it('should help iterate over a border composite value while reducing it to CSS string', () => {
      const tokens: JSONTokenTree = {
        border: {
          $type: 'border',
          $value: {
            color: '#cfd5e6',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const borderToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('border', ['border']),
      );

      const result = borderToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapObjectValue((obj) =>
          obj.flatMap((v) => {
            const color = v.color
              .mapAliasReference((r) => r.to.treePath.string)
              .mapScalarValue((v) => v.raw)
              .unwrap();
            const style = v.style
              .mapAliasReference((r) => r.to.treePath.string)
              .mapScalarValue((v) => v.raw)
              .unwrap();
            const width = v.width
              .mapAliasReference((r) => r.to.treePath.string)
              .mapScalarValue((v) => v.raw)
              .unwrap();
            return `${width} ${style} ${color}`;
          }),
        )
        .unwrap();

      expect(result).toStrictEqual('1px solid #cfd5e6');
    });
    it('should help iterate over a nested referenced composite value', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
        },
        strokeStyle: {
          $type: 'strokeStyle',
          $value: {
            dashArray: ['2px', '4px'],
            lineCap: 'round',
          },
        },
        border: {
          $type: 'border',
          $value: {
            color: '{color.blue}',
            style: '{strokeStyle}',
            width: '3px',
          },
        },
      };
      const treeState = buildTreeState(tokens);

      const borderToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('border', ['border']),
      );

      const result = borderToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapObjectValue((obj) =>
          obj
            .mapKey('color', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .mapKey('style', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .mapKey('width', (v) =>
              v
                .mapScalarValue((v) => v.raw)
                .mapAliasReference((r) => r.to.treePath.string)
                .unwrap(),
            )
            .unwrap(),
        )
        .unwrap();

      expect(result).toStrictEqual({
        color: 'color.blue',
        style: 'strokeStyle',
        width: '3px',
      });
    });
    it('should help iterate over a gradient array value', () => {
      const tokens: JSONTokenTree = {
        gradient: {
          $type: 'gradient',
          $value: [
            {
              color: '#cfd5e6',
              position: 0,
            },
            {
              color: '#ffffff',
              position: 1,
            },
          ],
        },
      };
      const treeState = buildTreeState(tokens);

      const gradientToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('gradient', ['gradient']),
      );

      const result = gradientToken
        ?.getValueMapper()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapArrayValue((av) =>
          av
            .mapItems((vm) =>
              vm
                .mapObjectValue((ov) =>
                  ov.flatMap((ob) => {
                    const color = ob.color
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((ar) => ar.to.treePath.string)
                      .unwrap();
                    const position = ob.position
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((ar) => ar.to.treePath.string)
                      .unwrap();

                    return `${color} ${
                      typeof position === 'number'
                        ? `${position * 100}%`
                        : position
                    }`;
                  }),
                )
                .unwrap(),
            )
            .unwrap()
            .join(', '),
        )
        .unwrap();

      expect(result).toBe('#cfd5e6 0%, #ffffff 100%');
    });
    it('should resolve values at the given depth while iterating over a chain of colors', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
          teal: {
            $value: '{color.cyan}',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tealToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'teal']),
      );

      expect(
        tealToken
          .getValueMapper({ resolveAtDepth: 0 })
          .mapAliasReference((r) => r.to.treePath.string)
          .mapScalarValue((v) => v.raw)
          .unwrap(),
      ).toBe('color.cyan');

      expect(
        tealToken
          .getValueMapper({ resolveAtDepth: 1 })
          .mapAliasReference((r) => r.to.treePath.string)
          .mapScalarValue((v) => v.raw)
          .unwrap(),
      ).toBe('color.blue');

      expect(
        tealToken
          .getValueMapper({ resolveAtDepth: 2 })
          .mapAliasReference((r) => r.to.treePath.string)
          .mapScalarValue((v) => v.raw)
          .unwrap(),
      ).toBe('#cfd5e6');
    });
    it('should resolve as deeply as possible when using: resolveAtDepth: "infinity"', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
          teal: {
            $value: '{color.cyan}',
          },
          indigo: {
            $value: '{color.teal}',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const indigoToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'indigo']),
      );

      expect(
        indigoToken
          .getValueMapper({ resolveAtDepth: 'infinity' })
          .mapAliasReference((r) => r.to.treePath.string)
          .mapScalarValue((v) => v.raw)
          .unwrap(),
      ).toBe('#cfd5e6');
    });

    it('should fail when using: resolveAtDepth: -1', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const cyanToken = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'cyan']),
      );

      expect(() =>
        cyanToken.getValueMapper({ resolveAtDepth: -1 }),
      ).toThrowError('resolveAtDepth must be "infinity" or greater than 0');
    });
  });
});
