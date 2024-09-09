import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { parseDesignTokens } from '../../src/parseDesignTokens';

describe('TokenTree', () => {
  describe('getErrors', () => {
    it('should get an empty validation errors array from a valid tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const errors = tokenTree.getErrors();
      expect(errors).toHaveLength(0);
    });
    it('should get validation errors from an invalid tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            // @ts-expect-error
            100: {
              $type: 'color',
              $value: 'invalid color',
            },
          },
        },
        space: {
          // @ts-expect-error
          1: {
            $type: 'dimension',
            $value: 'invalid dimension',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const errors = tokenTree.getErrors();
      expect(errors).toHaveLength(2);

      expect(errors.map((e) => e.toJSON())).toStrictEqual([
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['color', 'blue', '100'],
          nodeKey: '$value',
          valuePath: [],
          referenceToTreePath: undefined,
          message:
            'color.blue.100.$value must start with "#" and have a length of 6 or 8. Got: "invalid color".',
        },
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['space', '1'],
          nodeKey: '$value',
          valuePath: [],
          referenceToTreePath: undefined,
          message:
            'space.1.$value must be a number followed by "px" or "rem". Got: "invalid dimension".',
        },
      ]);
    });
    it('should get validation errors from a tree with circular references', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            $type: 'color',
            $value: '{color.indigo}',
          },
          cyan: {
            $type: 'color',
            $value: '{color.blue}',
          },
          indigo: {
            $type: 'color',
            $value: '{color.cyan}',
          },
          red: {
            $type: 'color',
            $value: '{color.red}',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);
      expect(tokenTree).toBeDefined();

      expect(tokenTree.getAllTokens()).toHaveLength(0);

      const errors = tokenTree.getErrors();

      expect(errors).toHaveLength(4);
      expect(errors.map((e) => e.toJSON())).toStrictEqual([
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['color', 'blue'],
          nodeKey: '$value',
          valuePath: [],
          referenceToTreePath: ['color', 'indigo'],
          message:
            'Circular reference detected: color.blue -> color.indigo -> color.cyan -> color.blue.',
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
            'Circular reference detected: color.cyan -> color.blue -> color.indigo -> color.cyan.',
        },
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['color', 'indigo'],
          nodeKey: '$value',
          valuePath: [],
          referenceToTreePath: ['color', 'cyan'],
          message:
            'Circular reference detected: color.indigo -> color.cyan -> color.blue -> color.indigo.',
        },
        {
          type: 'Value',
          isCritical: false,
          nodeId: expect.any(String),
          treePath: ['color', 'red'],
          nodeKey: '$value',
          valuePath: [],
          referenceToTreePath: ['color', 'red'],
          message: 'Circular reference detected: color.red -> color.red.',
        },
      ]);
    });
  });
  describe('getAllTokens', () => {
    it('should get all tokens from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const results = tokenTree.getAllTokens();

      expect(results).toHaveLength(2);
      expect(results.map((t) => t.stringPath)).toStrictEqual([
        'color.blue.100',
        'space.1',
      ]);
    });
  });
  describe('getAllTokensByType', () => {
    it('should get all tokens of a specific type from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const results = tokenTree.getAllTokensByType('color');

      expect(results).toHaveLength(1);
      expect(results[0].stringPath).toBe('color.blue.100');
    });
  });
  describe('getToken', () => {
    it('should get a token from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree.getToken(['color', 'blue', '100']);

      if (!result.isSome()) throw new Error('Token not found');

      expect(result.value.stringPath).toBe('color.blue.100');
      expect(result.value.type).toBe('color');
    });
  });
  describe('getTokenOfType', () => {
    it('should get a token of a specific type from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree
        .getTokenOfType('color', ['color', 'blue', '100'])
        .match({
          Some: (token) => token,
          None: () => {
            throw new Error('Token not found');
          },
        });

      expect(result.stringPath).toBe('color.blue.100');
    });
    it('should not get a token not matching the type', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
      };
      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree
        .getTokenOfType('dimension', ['color', 'blue', '100'])
        .match({
          Some: () => {
            throw new Error('Token found');
          },
          None: () => {
            return null;
          },
        });

      expect(result).toBe(null);
    });
  });
  describe('mapTokensByType', () => {
    it('should map over all tokens of a specific type', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const results = tokenTree.mapTokensByType('color', (token) => {
        return token.stringPath;
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toBe('color.blue.100');
    });
  });

  describe('getAllGroups', () => {
    it('should get all groups from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const results = tokenTree.getAllGroups();

      expect(results).toHaveLength(3);
      expect(results.map((t) => t.stringPath)).toStrictEqual([
        'color',
        'color.blue',
        'space',
      ]);
    });
  });
  describe('getGroup', () => {
    it('should get a group from the tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree.getGroup(['color', 'blue']);

      if (!result.isSome()) throw new Error('Group not found');

      expect(result.value.stringPath).toBe('color.blue');
    });
  });

  describe('toJSON', () => {
    it('should produce the JSON representation of the token tree', () => {
      const tokens: JSONTokenTree = {
        color: {
          blue: {
            100: {
              $type: 'color',
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          1: {
            $type: 'dimension',
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree.toJSON();

      expect(result).toStrictEqual(tokens);
    });
    it('should produce the initial JSON representation with group type declarations', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            100: {
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          $type: 'dimension',
          1: {
            $value: '4px',
          },
        },
      };

      const tokenTree = parseDesignTokens(tokens);

      const result = tokenTree.toJSON();

      expect(result).toStrictEqual({
        color: {
          $type: 'color',
          blue: {
            '100': {
              $value: '#cfd5e6',
            },
          },
        },
        space: {
          $type: 'dimension',
          '1': {
            $value: '4px',
          },
        },
      });
    });
  });
});
