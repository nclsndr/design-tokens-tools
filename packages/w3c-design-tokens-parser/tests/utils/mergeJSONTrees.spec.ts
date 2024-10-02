import { describe, expect, it } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { mergeJSONTrees } from '../../src/utils/mergeJSONTrees.js';
import { Either } from 'effect';

describe.concurrent('mergeJSONTrees', () => {
  it('should merge two non-conflicting trees', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        white: {
          $type: 'color',
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $type: 'color',
            $value: '#1D93DC',
          },
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        black: {
          $type: 'color',
          $value: '#000000',
        },
        secondary: {
          500: {
            $type: 'color',
            $value: '#FF0000',
          },
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => t,
        onLeft: (e) => {
          throw new Error(e);
        },
      },
    );

    expect(mergedTokens).toStrictEqual({
      color: {
        white: {
          $type: 'color',
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $type: 'color',
            $value: '#1D93DC',
          },
        },
        black: {
          $type: 'color',
          $value: '#000000',
        },
        secondary: {
          500: {
            $type: 'color',
            $value: '#FF0000',
          },
        },
      },
    });
  });
  it('should merge two trees with groups both defining $type', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        white: {
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $value: '#1D93DC',
          },
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        black: {
          $value: '#000000',
        },
        secondary: {
          500: {
            $value: '#FF0000',
          },
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => t,
        onLeft: (e) => {
          throw new Error(e);
        },
      },
    );

    expect(mergedTokens).toStrictEqual({
      color: {
        $type: 'color',
        white: {
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $value: '#1D93DC',
          },
        },
        black: {
          $value: '#000000',
        },
        secondary: {
          500: {
            $value: '#FF0000',
          },
        },
      },
    });
  });
  it('should merge two trees conflicting on tokens', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        white: {
          $type: 'color',
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $type: 'color',
            $value: '#1D93DC',
          },
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        white: {
          $type: 'color',
          $value: '#FFFFFF',
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => {
          throw t;
        },
        onLeft: (msg) => msg,
      },
    );

    expect(mergedTokens).toBe(
      'Token with path "color.white" already exists in source.',
    );
  });
  it('should merge two trees conflicting on group defining $description in source', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        $description: 'Color tokens',
        white: {
          $value: '#FFFFFF',
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        black: {
          $value: '#000000',
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => {
          throw t;
        },
        onLeft: (msg) => msg,
      },
    );

    expect(mergedTokens).toBe(
      'Group with path "color" already defines the $description property.',
    );
  });
  it('should merge two trees conflicting on group defining $description in target', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        white: {
          $value: '#FFFFFF',
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        $description: 'Color tokens',
        black: {
          $value: '#000000',
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => {
          throw t;
        },
        onLeft: (msg) => msg,
      },
    );

    expect(mergedTokens).toBe(
      'Group with path "color" already defines the $description property.',
    );
  });
  it('should merge two trees conflicting on group defining $extensions in source', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        $extensions: {
          'com.example': true,
        },
        white: {
          $value: '#FFFFFF',
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        black: {
          $value: '#000000',
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => {
          throw t;
        },
        onLeft: (msg) => msg,
      },
    );

    expect(mergedTokens).toBe(
      'Group with path "color" already defines the $extensions property.',
    );
  });
  it('should merge two trees conflicting on group defining $extensions in target', () => {
    const sourceTokens: JSONTokenTree = {
      color: {
        $type: 'color',

        white: {
          $value: '#FFFFFF',
        },
      },
    };
    const targetTokens: JSONTokenTree = {
      color: {
        $type: 'color',
        $extensions: {
          'com.example': true,
        },
        black: {
          $value: '#000000',
        },
      },
    };

    const mergedTokens = Either.match(
      mergeJSONTrees(sourceTokens, targetTokens),
      {
        onRight: (t) => {
          throw t;
        },
        onLeft: (msg) => msg,
      },
    );

    expect(mergedTokens).toBe(
      'Group with path "color" already defines the $extensions property.',
    );
  });
});
