import { describe, it, expect } from 'vitest';

import { recursivelyResolveTokenTypeFromParents } from '../../src/parser/token/recursivelyResolveTokenTypeFromParents';
import { Cause, Effect, Exit } from 'effect';

describe.concurrent('recursivelyResolveTokenTypeFromParents', () => {
  it('should resolve a type at a given path', () => {
    const tree = {
      aGroup: {
        blue: {
          $value: '#0000ff',
          $type: 'color',
        },
      },
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      resolvedType: 'color',
      paths: [['aGroup', 'blue']],
    });
  });
  it('should resolve a type from a given path to the closest parent with a type', () => {
    const tree = {
      aGroup: {
        $type: 'color',
        aSubGroup: {
          blue: {
            $value: '#0000ff',
          },
        },
      },
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'aSubGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      resolvedType: 'color',
      paths: [
        ['aGroup'],
        ['aGroup', 'aSubGroup'],
        ['aGroup', 'aSubGroup', 'blue'],
      ],
    });
  });
  it('should resolve a type at the root level', () => {
    const tree = {
      aGroup: {
        blue: {
          $value: '#0000ff',
        },
      },
      $type: 'color',
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      resolvedType: 'color',
      paths: [[], ['aGroup'], ['aGroup', 'blue']],
    });
  });
  it('should fail when no type is found up to the root level', () => {
    const tree = {
      aGroup: {
        blue: {
          $value: '#0000ff',
        },
      },
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
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
        treePath: ['aGroup', 'blue'],
        valuePath: [],
        message: 'Could not resolve $type from token up to root.',
      },
    ]);
  });
  it('should fail when the type is invalid at the token level', () => {
    const tree = {
      aGroup: {
        blue: {
          $value: '#0000ff',
          $type: 'invalid',
        },
      },
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
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
        treePath: ['aGroup', 'blue'],
        valuePath: [],
        message: expect.stringContaining(
          'Invalid $type "invalid" at path: "aGroup.blue".',
        ),
      },
    ]);
  });
  it('should fail when the type is invalid at the root level', () => {
    const tree = {
      aGroup: {
        blue: {
          $value: '#0000ff',
        },
      },
      $type: 'invalid',
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
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
        treePath: ['aGroup', 'blue'],
        valuePath: [],
        message:
          'Invalid $type "invalid" for path: "aGroup.blue" while being resolved from root.',
      },
    ]);
  });
  it('should fail when the type is invalid at any intermediate level', () => {
    const tree = {
      aLargerGroup: {
        aGroup: {
          blue: {
            $value: '#0000ff',
          },
        },
        $type: 'invalid',
      },
    };

    const program = recursivelyResolveTokenTypeFromParents(tree, [
      'aLargerGroup',
      'aGroup',
      'blue',
    ]);

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
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
        treePath: ['aLargerGroup', 'aGroup', 'blue'],
        valuePath: [],
        message:
          'Invalid $type "invalid" for path: "aLargerGroup.aGroup.blue" while being resolved from "aLargerGroup".',
      },
    ]);
  });
});
