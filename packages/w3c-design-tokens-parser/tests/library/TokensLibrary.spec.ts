import { describe, it, expect } from 'vitest';
import { Option } from 'effect';
import { JSONTokenTree } from 'design-tokens-format-module';

import { TokensLibrary } from '../../src/library/TokensLibrary';

describe.concurrent('TokensLibrary', () => {
  describe.concurrent('addSet', () => {
    it('should add a set to the library', () => {
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

      library.addSet({
        name: 'base',
        jsonTree: tokens,
      });

      const foundSet = Option.getOrThrow(library.getSet('base'));

      expect(foundSet.name).toBe('base');
      expect(foundSet.jsonTree).toStrictEqual(tokens);
      expect(foundSet.treeState).toBeDefined();
    });
    it('should add a set from JSON string to the library', () => {
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

      library.addSet({
        name: 'base',
        jsonTree: JSON.stringify(tokens),
      });

      const foundSet = Option.getOrThrow(library.getSet('base'));

      expect(foundSet.name).toBe('base');
      expect(foundSet.jsonTree).toStrictEqual(tokens);
      expect(foundSet.treeState).toBeDefined();
    });
    it('should fail if the set has validation errors', () => {
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
        library.addSet({
          name: 'base',
          jsonTree: tokens,
        });
      }).toThrowError(`Set "base" has errors:
  - color.blue.500.$value must start with "#" and have a length of 6 or 8. Got: "invalid blue".
  - color.red.500.$value must start with "#" and have a length of 6 or 8. Got: "invalid red".`);
    });
  });
  describe.concurrent('addTheme', () => {
    it('should add a theme to the library', () => {
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addSet({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addTheme({
        name: 'colors',
        modes: [
          {
            name: 'light',
            sets: [{ name: 'light' }],
          },
          {
            name: 'dark',
            sets: [{ name: 'dark' }],
          },
        ],
      });

      const lightColors = Option.getOrThrow(
        library.getThemeMode('colors', 'light'),
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
        library.getThemeMode('colors', 'dark'),
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
    it('should fail when the referenced set does not exist', () => {
      const library = new TokensLibrary([], []);

      expect(() => {
        library.addTheme({
          name: 'colors',
          modes: [
            {
              name: 'light',
              sets: [{ name: 'light' }],
            },
          ],
        });
      }).toThrowError('Set "light" does not exist in library.');
    });
    it('should fail when the merge of sets conflicts', () => {
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addSet({
        name: 'dark',
        jsonTree: darkTokens,
      });

      expect(() => {
        library.addTheme({
          name: 'colors',
          modes: [
            {
              name: 'all',
              sets: [{ name: 'light' }, { name: 'dark' }],
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addSet({
        name: 'dark',
        jsonTree: darkTokens,
      });
      library.addSet({
        name: 'highContrast',
        jsonTree: highContrastTokens,
      });

      expect(() => {
        library.addTheme({
          name: 'colors',
          modes: [
            {
              name: 'light',
              sets: [{ name: 'light' }],
            },
            {
              name: 'dark',
              sets: [{ name: 'dark' }],
            },
            {
              name: 'highContrast',
              sets: [{ name: 'highContrast' }],
            },
          ],
        });
      }).toThrowError(`The following paths are missing:
dark         -> color.black
                color.primary
highContrast -> color.black`);
    });
  });
  describe.concurrent('getSet', () => {
    it('should return a set from the library', () => {
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

      library.addSet({
        name: 'base',
        jsonTree: tokens,
      });

      const foundSet = Option.getOrThrow(library.getSet('base'));

      expect(foundSet.name).toBe('base');
      expect(foundSet.jsonTree).toStrictEqual(tokens);
      expect(foundSet.treeState).toBeDefined();
    });
    it('should return none when the set does not exist', () => {
      const library = new TokensLibrary([], []);

      const foundSet = Option.getOrUndefined(library.getSet('base'));

      expect(foundSet).toBeUndefined();
    });
  });
  describe.concurrent('getThemeMode', () => {
    it('should return a theme mode from the library', () => {
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addSet({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addTheme({
        name: 'colors',
        modes: [
          {
            name: 'light',
            sets: [{ name: 'light' }],
          },
          {
            name: 'dark',
            sets: [{ name: 'dark' }],
          },
        ],
      });

      const lightColors = Option.getOrThrow(
        library.getThemeMode('colors', 'light'),
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
    it('should return none when the mode does not exist in theme', () => {
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });

      library.addTheme({
        name: 'colors',
        modes: [
          {
            name: 'light',
            sets: [{ name: 'light' }],
          },
        ],
      });

      const foundTokens = Option.getOrUndefined(
        library.getThemeMode('colors', 'dark'),
      );

      expect(foundTokens).toBeUndefined();
    });
    it('should return none when the theme does not exist', () => {
      const library = new TokensLibrary([], []);

      const foundTheme = Option.getOrUndefined(
        library.getThemeMode('colors', 'light'),
      );

      expect(foundTheme).toBeUndefined();
    });
  });
  describe.concurrent('selectTokens', () => {
    it('should select tokens from set and theme within the library', () => {
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

      library.addSet({
        name: 'light',
        jsonTree: lightTokens,
      });
      library.addSet({
        name: 'dark',
        jsonTree: darkTokens,
      });

      library.addTheme({
        name: 'colors',
        modes: [
          {
            name: 'light',
            sets: [{ name: 'light' }],
          },
          {
            name: 'dark',
            sets: [{ name: 'dark' }],
          },
        ],
      });

      const tokens = library.selectTokens([
        { type: 'set', name: 'light' },
        { type: 'theme', name: 'colors', mode: 'dark' },
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
        library.selectTokens([
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
