import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { recursivelyResolveTokenType } from '../../../src/parser/token/recursivelyResolveTokenType';
import { Cause, Effect, Exit } from 'effect';

describe('recursivelyResolveTokenType', () => {
  it('should resolve an explicit type', () => {
    const tokenTree: JSONTokenTree = {
      aColor: {
        $type: 'color',
        $value: '#ff0000',
      },
    };

    const program = recursivelyResolveTokenType(tokenTree, ['aColor']);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (x) => x,
        onFailure: () => null,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border2',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'base',
      'background',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'colors',
      'primary',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
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

    const program = recursivelyResolveTokenType(tokenTree, [
      'semantic',
      'border',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => null,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
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

    const program = recursivelyResolveTokenType(tokenTree, ['base', 'blue']);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => null,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
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

    const program = recursivelyResolveTokenType(tokenTree, ['base', 'blue']);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => null,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
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
