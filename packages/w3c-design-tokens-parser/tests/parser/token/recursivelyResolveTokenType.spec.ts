import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { recursivelyResolveTokenType } from '../../../src/parser/token/recursivelyResolveTokenType';
import { Either, Option } from 'effect';

describe('recursivelyResolveTokenType', () => {
  it('should resolve an explicit type', () => {
    const tokenTree: JSONTokenTree = {
      aColor: {
        $type: 'color',
        $value: '#ff0000',
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, ['aColor']);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'explicit',
      resolvedType: 'color',
      paths: [['aColor']],
    });
  });
  it('should resolve a shallow alias type', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      semantic: {
        border: {
          $value: '{base.blue}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'alias',
      resolvedType: 'color',
      paths: [
        ['base', 'blue'],
        ['semantic', 'border'],
      ],
    });
  });
  it('should resolve a deep alias type', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      semantic: {
        border: {
          $value: '{base.blue}',
        },
        border2: {
          $value: '{semantic.border}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border2',
    ]);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'alias',
      resolvedType: 'color',
      paths: [
        ['base', 'blue'],
        ['semantic', 'border'],
        ['semantic', 'border2'],
      ],
    });
  });
  it('should resolve a type via parents', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        $type: 'color',
        background: {
          blue: {
            $value: '#0000ff',
          },
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'base',
      'background',
      'blue',
    ]);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'parent',
      resolvedType: 'color',
      paths: [['base'], ['base', 'background'], ['base', 'background', 'blue']],
    });
  });
  it('should resolve an alias type via parents', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        $type: 'color',
        solid: {
          blue: {
            $value: '#2156AA',
          },
        },
      },
      semantic: {
        border: {
          $value: '{base.solid.blue}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'alias',
      resolvedType: 'color',
      paths: [
        ['base'],
        ['base', 'solid'],
        ['base', 'solid', 'blue'],
        ['semantic', 'border'],
      ],
    });
  });
  it('should resolve an alias type via parents once the alias resolution failed', () => {
    const tokenTree: JSONTokenTree = {
      colors: {
        $type: 'color',
        primary: {
          $value: '{colors.blue}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'colors',
      'primary',
    ]);

    expect(Either.getOrThrow(result)).toStrictEqual({
      resolution: 'parent',
      resolvedType: 'color',
      paths: [['colors'], ['colors', 'primary']],
    });
  });
  it('should fail to resolve when path points to a group', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        $type: 'color',
      },
      semantic: {
        border: {
          $value: '{base}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: '',
        treePath: ['semantic', 'border'],
        valuePath: [],
        message: 'Could not resolve $type from token up to root.',
      },
    ]);
  });
  it('should fail to resolve when alias is circular', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        $type: 'color',
        blue: {
          $value: '{base.blue}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, ['base', 'blue']);

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Computation',
        isCritical: false,
        nodeId: '',
        treePath: ['base', 'blue'],
        valuePath: [],
        referenceToTreePath: ['base', 'blue'],
        message:
          'Circular references detected while resolving token type for token "base.blue".',
      },
    ]);
  });
  it('should fail to resolve when alias is deeply circular', () => {
    const tokenTree: JSONTokenTree = {
      base: {
        $type: 'color',
        blue: {
          $value: '{semantic.text}',
        },
      },
      semantic: {
        border: {
          $value: '{base.blue}',
        },
        text: {
          $value: '{semantic.border}',
        },
      },
    };

    const result = recursivelyResolveTokenType(tokenTree, ['base', 'blue']);

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Computation',
        isCritical: false,
        nodeId: '',
        treePath: expect.any(Array),
        valuePath: [],
        referenceToTreePath: expect.any(Array),
        message: expect.stringContaining(
          'Circular references detected while resolving token type',
        ),
      },
    ]);
  });
});
