import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';
import { buildTreeState } from '../../src/state/buildTreeState';
import { Option } from 'effect';

describe('TreeState', () => {
  describe.concurrent('getTokenByPath', () => {
    const tokens: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          500: {
            $value: '#0000FF',
          },
        },
      },
      dimension: {
        $type: 'dimension',
        base: {
          $value: '4px',
        },
      },
    };
    const treeState = buildTreeState(tokens);

    it('should return the correct token by path', () => {
      const token = Option.getOrThrow(
        treeState.getTokenByPath(['color', 'blue', '500']),
      );
      expect(token?.getJSONValue()).toBe('#0000FF');
    });
    it('should return undefined for a non-existent path', () => {
      const token = Option.getOrUndefined(
        treeState.getTokenByPath(['color', 'red', '500']),
      );
      expect(token).toBeUndefined();
    });
  });
  describe.concurrent('getTokenOfTypeByPath', () => {
    const tokens: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          500: {
            $value: '#0000FF',
          },
        },
      },
      dimension: {
        $type: 'dimension',
        base: {
          $value: '4px',
        },
      },
    };
    const treeState = buildTreeState(tokens);

    it('should return the correct token by path and type', () => {
      const token = Option.getOrThrow(
        treeState.getTokenOfTypeByPath('color', ['color', 'blue', '500']),
      );
      expect(token?.getJSONValue()).toBe('#0000FF');
    });
    it('should return undefined for a non-existent path', () => {
      const token = Option.getOrUndefined(
        treeState.getTokenOfTypeByPath('color', ['dimension', 'base']),
      );
      expect(token).toBeUndefined();
    });
    it('should return undefined for a non-existent type at this location', () => {
      const token = Option.getOrUndefined(
        treeState.getTokenOfTypeByPath('dimension', ['color', 'blue', '500']),
      );
      expect(token).toBeUndefined();
    });
  });
  describe.concurrent('selectTokens', () => {
    it('should select any token when no options are provided', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
        semantic: {
          background: {
            $value: '{color.blue.500}',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({});

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.500',
        'dimension.base',
        'semantic.background',
      ]);
    });
    it('should select the tokens based on tokenType', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
        border: {
          $type: 'border',
          base: {
            $value: {
              width: '1px',
              style: 'solid',
              color: '#000000',
            },
          },
        },
        semantic: {
          background: {
            $value: '{color.blue.500}',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      expect(treeState.tokenStates.nodes).toHaveLength(4);

      const tokenStates = treeState.selectTokens({
        tokenTypes: ['color', 'dimension'],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.500',
        'dimension.base',
        'semantic.background',
      ]);
    });
    it('should select the tokens based on exact match', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['color', 'blue', '500']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.500',
      ]);
    });
    it('should not select the tokens based on group exact match', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['color', 'blue']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([]);
    });
    it('should select the tokens based on wildcard match', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
            600: {
              $value: '#3232FF',
            },
          },
          red: {
            500: {
              $value: '#FF0000',
            },
            600: {
              $value: '#FF3232',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['color', '*', '500']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.500',
        'color.red.500',
      ]);
    });
    it('should select the tokens into a shallow group based on trailing wildcard match', () => {
      const tokens: JSONTokenTree = {
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
          double: {
            $value: '8px',
          },
          nested: {
            alt: {
              $value: '4px',
            },
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['dimension', '*']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'dimension.base',
        'dimension.double',
      ]);
    });
    it('should select none of the tokens into a deep group based on trailing wildcard match', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
            600: {
              $value: '#3232FF',
            },
          },
          red: {
            500: {
              $value: '#FF0000',
            },
            600: {
              $value: '#FF3232',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['color', '*']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([]);
    });
    it('should select the tokens based on a double trailing wildcard match', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#0000FF',
            },
            600: {
              $value: '#3232FF',
            },
          },
          red: {
            500: {
              $value: '#FF0000',
            },
            600: {
              $value: '#FF3232',
            },
          },
        },
        dimension: {
          $type: 'dimension',
          base: {
            $value: '4px',
          },
        },
      };

      const treeState = buildTreeState(tokens);

      const tokenStates = treeState.selectTokens({
        where: [['color', '**']],
      });

      expect(tokenStates.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.500',
        'color.blue.600',
        'color.red.500',
        'color.red.600',
      ]);
    });
  });
});
