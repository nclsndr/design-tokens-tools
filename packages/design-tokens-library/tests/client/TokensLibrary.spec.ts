import { describe, it, expect } from 'vitest';
import { Option } from 'effect';
import { JSONTokenTree } from 'design-tokens-format-module';

import { TokensLibrary } from '../../src/client/TokensLibrary';

describe.concurrent('TokensLibrary', () => {
  describe.concurrent('addTokenTree', () => {
    it('should add a tokenTree to the library', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#1D40C8',
            },
          },
          red: {
            500: {
              $value: '#E10C44',
            },
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'base',
        jsonTree: tokens,
      });

      const foundSet = Option.getOrThrow(library.state.getTreeState('base'));

      expect(foundSet.treeName).toBe('base');
      expect(foundSet.toJSON()).toStrictEqual(tokens);
    });
    it('should add a tokenTree from JSON string to the library', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#1D40C8',
            },
          },
          red: {
            500: {
              $value: '#E10C44',
            },
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'base',
        jsonTree: JSON.stringify(tokens),
      });

      const foundSet = Option.getOrThrow(library.state.getTreeState('base'));

      expect(foundSet.treeName).toBe('base');
      expect(foundSet.toJSON()).toStrictEqual(tokens);
    });
    it('should fail if the tokenTree has validation errors', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: 'invalid blue',
            },
          },
          red: {
            500: {
              $value: 'invalid red',
            },
          },
        },
      };

      const library = new TokensLibrary([], []);

      expect(() => {
        library.addTokenTree({
          name: 'base',
          jsonTree: tokens,
        });
      }).toThrowError(`Tree "base" has errors:
  - color.blue.500.$value must start with "#" and have a length of 6 or 8. Got: "invalid blue".
  - color.red.500.$value must start with "#" and have a length of 6 or 8. Got: "invalid red".`);
    });
  });
  describe.concurrent('addCollection', () => {
    it('should add a collection to the library', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };
      const darkTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          black: {
            $type: 'color',
            $value: '#FFFFFF',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addTokenTree({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addCollection({
        name: 'colors',
        modes: [
          {
            name: 'light',
            tokenTrees: [{ name: 'light' }],
          },
          {
            name: 'dark',
            tokenTrees: [{ name: 'dark' }],
          },
        ],
      });

      const lightColors = Option.getOrThrow(
        library.state.getCollectionMode('colors', 'light'),
      );

      expect(lightColors.name).toBe('light');
      expect(lightColors.jsonTree).toStrictEqual({
        color: {
          white: {
            $type: 'color', // group merge causes the $type to become explicit on tokens
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      });
      expect(lightColors.treeState).toBeDefined();

      const darkColors = Option.getOrThrow(
        library.state.getCollectionMode('colors', 'dark'),
      );

      expect(darkColors.name).toBe('dark');
      expect(darkColors.jsonTree).toStrictEqual({
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          black: {
            $type: 'color',
            $value: '#FFFFFF',
          },
        },
      });
      expect(darkColors.treeState).toBeDefined();
    });
    it('should fail when the referenced tokenTree does not exist', () => {
      const library = new TokensLibrary([], []);

      expect(() => {
        library.addCollection({
          name: 'colors',
          modes: [
            {
              name: 'light',
              tokenTrees: [{ name: 'light' }],
            },
          ],
        });
      }).toThrowError('Set "light" does not exist in library.');
    });
    it('should fail when the merge of trees conflicts', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };
      const darkTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          black: {
            $type: 'color',
            $value: '#FFFFFF',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addTokenTree({
        name: 'dark',
        jsonTree: darkTokens,
      });

      expect(() => {
        library.addCollection({
          name: 'colors',
          modes: [
            {
              name: 'all',
              tokenTrees: [{ name: 'light' }, { name: 'dark' }],
            },
          ],
        });
      }).toThrowError(
        'Token with path "color.white" already exists in source.',
      );
    });
    it('should fail when the comparison of modes errors', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
          primary: {
            $type: 'color',
            $value: '#00782f',
          },
        },
      };
      const darkTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };
      const highContrastTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          primary: {
            $type: 'color',
            $value: '#004218',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addTokenTree({
        name: 'dark',
        jsonTree: darkTokens,
      });
      library.addTokenTree({
        name: 'highContrast',
        jsonTree: highContrastTokens,
      });

      expect(() => {
        library.addCollection({
          name: 'colors',
          modes: [
            {
              name: 'light',
              tokenTrees: [{ name: 'light' }],
            },
            {
              name: 'dark',
              tokenTrees: [{ name: 'dark' }],
            },
            {
              name: 'highContrast',
              tokenTrees: [{ name: 'highContrast' }],
            },
          ],
        });
      }).toThrowError(`The following paths are missing:
dark         -> color.black
                color.primary
highContrast -> color.black`);
    });
  });
  describe.concurrent('getTreeState', () => {
    it('should return a tokenTree from the library', () => {
      const tokens: JSONTokenTree = {
        color: {
          $type: 'color',
          blue: {
            500: {
              $value: '#1D40C8',
            },
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'base',
        jsonTree: tokens,
      });

      const foundSet = Option.getOrThrow(library.state.getTreeState('base'));

      expect(foundSet.treeName).toBe('base');
      expect(foundSet.toJSON()).toStrictEqual(tokens);
    });
    it('should return none when the tokenTree does not exist', () => {
      const library = new TokensLibrary([], []);

      const foundSet = Option.getOrUndefined(
        library.state.getTreeState('base'),
      );

      expect(foundSet).toBeUndefined();
    });
  });
  describe.concurrent('getCollectionMode', () => {
    it('should return a collection mode from the library', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };
      const darkTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          black: {
            $type: 'color',
            $value: '#FFFFFF',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addTokenTree({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addCollection({
        name: 'colors',
        modes: [
          {
            name: 'light',
            tokenTrees: [{ name: 'light' }],
          },
          {
            name: 'dark',
            tokenTrees: [{ name: 'dark' }],
          },
        ],
      });

      const lightColors = Option.getOrThrow(
        library.state.getCollectionMode('colors', 'light'),
      );

      expect(lightColors.name).toBe('light');
      expect(lightColors.jsonTree).toStrictEqual({
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      });
      expect(lightColors.treeState).toBeDefined();
    });
    it('should return none when the mode does not exist in collection', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });

      library.addCollection({
        name: 'colors',
        modes: [
          {
            name: 'light',
            tokenTrees: [{ name: 'light' }],
          },
        ],
      });

      const foundTokens = Option.getOrUndefined(
        library.state.getCollectionMode('colors', 'dark'),
      );

      expect(foundTokens).toBeUndefined();
    });
    it('should return none when the collection does not exist', () => {
      const library = new TokensLibrary([], []);

      const foundCollection = Option.getOrUndefined(
        library.state.getCollectionMode('colors', 'light'),
      );

      expect(foundCollection).toBeUndefined();
    });
  });
  describe.concurrent('selectTokenStates', () => {
    it('should select tokens from tokenTree and collection within the library', () => {
      const lightTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#FFFFFF',
          },
          black: {
            $type: 'color',
            $value: '#000000',
          },
        },
      };
      const darkTokens: JSONTokenTree = {
        color: {
          white: {
            $type: 'color',
            $value: '#000000',
          },
          black: {
            $type: 'color',
            $value: '#FFFFFF',
          },
        },
      };

      const library = new TokensLibrary([], []);

      library.addTokenTree({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addTokenTree({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addCollection({
        name: 'colors',
        modes: [
          {
            name: 'light',
            tokenTrees: [{ name: 'light' }],
          },
          {
            name: 'dark',
            tokenTrees: [{ name: 'dark' }],
          },
        ],
      });

      const tokens = library.state.selectTokens([
        { type: 'tokenTree', name: 'light' },
        { type: 'collection', name: 'colors', mode: 'dark' },
      ]);

      expect(
        tokens.map((t) => t.stringPath + ' ' + t.getJSONValue()),
      ).toStrictEqual([
        'color.white #FFFFFF',
        'color.black #000000',
        'color.white #000000',
        'color.black #FFFFFF',
      ]);
    });
    it('should fail when the selector type does not exists', () => {
      const library = new TokensLibrary([], []);

      expect(() => {
        library.state.selectTokens([
          {
            // @ts-expect-error - invalid selector type
            type: 'invalid',
            name: 'light',
          },
        ]);
      }).toThrowError('Unrecognized select type: "invalid".');
    });
  });
});
