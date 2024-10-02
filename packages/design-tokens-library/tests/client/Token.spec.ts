import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';
import { parseDesignTokens } from '../../src';

describe('Token', () => {
  describe('Getters', () => {
    it('should access the token properties', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
          red: {
            $type: 'color',
            $value: '#ff0000',
            $description: 'The red color',
            $extensions: {
              'com.example': true,
            },
          },
          cyan: {
            $value: '{color.blue}',
          },
          yellow: {
            $type: 'color',
            $value: '{unknown.reference}',
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      expect(blueToken?.path).toStrictEqual(['color', 'blue']);
      expect(blueToken?.stringPath).toBe('color.blue');
      expect(blueToken?.type).toBe('color');
      expect(blueToken?.description).toBeUndefined();
      expect(blueToken?.extensions).toBeUndefined();
      expect(blueToken?.summary).toStrictEqual({
        path: ['color', 'blue'],
        type: 'color',
        description: undefined,
        extensions: undefined,
        references: [],
        rawJSONValue: '#cfd5e6',
      });

      const redToken = tokenTree.getToken(['color', 'red']);
      expect(redToken?.path).toStrictEqual(['color', 'red']);
      expect(redToken?.stringPath).toBe('color.red');
      expect(redToken?.type).toBe('color');
      expect(redToken?.description).toBe('The red color');
      expect(redToken?.extensions).toStrictEqual({
        'com.example': true,
      });
      expect(redToken?.summary).toStrictEqual({
        path: ['color', 'red'],
        type: 'color',
        description: 'The red color',
        extensions: {
          'com.example': true,
        },
        references: [],
        rawJSONValue: '#ff0000',
      });

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.path).toStrictEqual(['color', 'cyan']);
      expect(cyanToken?.stringPath).toBe('color.cyan');
      expect(cyanToken?.type).toBe('color');
      expect(cyanToken?.description).toBeUndefined();
      expect(cyanToken?.extensions).toBeUndefined();
      expect(cyanToken?.summary).toStrictEqual({
        path: ['color', 'cyan'],
        type: 'color',
        description: undefined,
        extensions: undefined,
        rawJSONValue: '{color.blue}',
        references: [
          {
            fromTreePath: 'color.cyan',
            fromValuePath: '',
            toTreePath: 'color.blue',
            isFullyLinked: true,
            isShallowlyLinked: true,
          },
        ],
      });

      const yellowToken = tokenTree.getToken(['color', 'yellow']);
      expect(yellowToken?.path).toStrictEqual(['color', 'yellow']);
      expect(yellowToken?.stringPath).toBe('color.yellow');
      expect(yellowToken?.type).toBe('color');
      expect(yellowToken?.summary).toStrictEqual({
        path: ['color', 'yellow'],
        type: 'color',
        description: undefined,
        extensions: undefined,
        references: [
          {
            fromTreePath: 'color.yellow',
            fromValuePath: '',
            toTreePath: 'unknown.reference',
            isFullyLinked: false,
            isShallowlyLinked: false,
          },
        ],
        rawJSONValue: '{unknown.reference}',
      });
    });
  });
  describe('getJSONValue', () => {
    it('should get the JSON value as initially provided', () => {
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
        border: {
          $type: 'border',
          $value: {
            color: '{color.blue}',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      expect(blueToken?.getJSONValue()).toBe('#cfd5e6');

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONValue()).toBe('{color.blue}');

      const borderToken = tokenTree.getToken(['border']);
      expect(borderToken?.getJSONValue()).toStrictEqual({
        color: '{color.blue}',
        width: '1px',
        style: 'solid',
      });
    });
    it('should get the fully resolved value with `resolveToDepth: -1`', () => {
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
        border: {
          $type: 'border',
          $value: {
            color: '{color.cyan}',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONValue({ resolveToDepth: -1 })).toBe('#cfd5e6');

      const borderToken = tokenTree.getToken(['border']);
      expect(borderToken?.getJSONValue({ resolveToDepth: -1 })).toStrictEqual({
        color: '#cfd5e6',
        width: '1px',
        style: 'solid',
      });
    });
    it('should get the partially resolved value with `resolveToDepth: 1`', () => {
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
        border: {
          $type: 'border',
          $value: {
            color: '{color.cyan}',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONValue({ resolveToDepth: 1 })).toBe('#cfd5e6');

      const borderToken = tokenTree.getToken(['border']);
      expect(borderToken?.getJSONValue({ resolveToDepth: 1 })).toStrictEqual({
        color: '{color.blue}',
        width: '1px',
        style: 'solid',
      });
    });
    it('should get the non-resolved value with `resolveToDepth: 0`', () => {
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
        border: {
          $type: 'border',
          $value: {
            color: '{color.cyan}',
            width: '1px',
            style: 'solid',
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONValue({ resolveToDepth: 0 })).toBe(
        '{color.blue}',
      );

      const borderToken = tokenTree.getToken(['border']);
      expect(borderToken?.getJSONValue({ resolveToDepth: 0 })).toStrictEqual({
        color: '{color.cyan}',
        width: '1px',
        style: 'solid',
      });
    });
  });
  describe('getJSONToken', () => {
    it('should get the JSON token as initially provided', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
          red: {
            $value: '#ff0000',
            $description: 'The red color',
            $extensions: {
              'com.example': true,
            },
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      expect(blueToken?.getJSONToken()).toStrictEqual({
        $value: '#cfd5e6',
        $type: 'color',
      });

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONToken()).toStrictEqual({
        $value: '{color.blue}',
      });

      const redToken = tokenTree.getToken(['color', 'red']);
      expect(redToken?.getJSONToken()).toStrictEqual({
        $value: '#ff0000',
        $description: 'The red color',
        $extensions: {
          'com.example': true,
        },
      });
    });
    it('should get the JSON token with explicit token types', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
          red: {
            $value: '#ff0000',
            $description: 'The red color',
            $extensions: {
              'com.example': true,
            },
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      expect(blueToken?.getJSONToken({ withExplicitType: true })).toStrictEqual(
        {
          $value: '#cfd5e6',
          $type: 'color',
        },
      );

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONToken({ withExplicitType: true })).toStrictEqual(
        {
          $type: 'color',
          $value: '{color.blue}',
        },
      );

      const redToken = tokenTree.getToken(['color', 'red']);
      expect(redToken?.getJSONToken({ withExplicitType: true })).toStrictEqual({
        $type: 'color',
        $value: '#ff0000',
        $description: 'The red color',
        $extensions: {
          'com.example': true,
        },
      });
    });
    it('should get the JSON token with resolved values', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            $type: 'color',
            $value: '#cfd5e6',
          },
          cyan: {
            $value: '{color.blue}',
          },
          indigo: {
            $value: '{color.cyan}',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      expect(blueToken?.getJSONToken({ resolveToDepth: -1 })).toStrictEqual({
        $value: '#cfd5e6',
        $type: 'color',
      });

      const cyanToken = tokenTree.getToken(['color', 'cyan']);
      expect(cyanToken?.getJSONToken({ resolveToDepth: -1 })).toStrictEqual({
        $value: '#cfd5e6',
      });

      const indigoToken = tokenTree.getToken(['color', 'indigo']);
      expect(indigoToken?.getJSONToken({ resolveToDepth: -1 })).toStrictEqual({
        $value: '#cfd5e6',
      });
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
      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getToken(['color', 'blue']);
      const valueMapper = blueToken?.getValueMapper();

      expect(valueMapper?.toString()).toBe(`ValueMapper for "color.blue" {
  Scalar: #cfd5e6
}`);

      const strokeStyleToken = tokenTree.getToken(['strokeStyle']);
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

      const borderToken = tokenTree.getToken(['border']);
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
      const tokenTree = parseDesignTokens(tokens);

      const blueToken = tokenTree.getTokenOfType('color', ['color', 'blue']);

      const result = blueToken
        ?.getValueMapper<'dimension'>()
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
      const tokenTree = parseDesignTokens(tokens);

      const cyanToken = tokenTree.getToken(['color', 'cyan']);

      const result = cyanToken
        ?.getValueMapper<'color'>()
        .mapAliasReference((r) => r.to.treePath.string)
        .mapScalarValue((v) => v.raw)
        .unwrap();

      expect(result).toBe('color.blue');
    });
    it('should help iterate over a scalar composite value', () => {
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
      const tokenTree = parseDesignTokens(tokens);

      const borderToken = tokenTree.getToken(['border']);

      const result = borderToken
        ?.getValueMapper<'border'>()
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
      const tokenTree = parseDesignTokens(tokens);

      const borderToken = tokenTree.getToken(['border']);

      const result = borderToken
        ?.getValueMapper<'border'>()
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
  });
});
