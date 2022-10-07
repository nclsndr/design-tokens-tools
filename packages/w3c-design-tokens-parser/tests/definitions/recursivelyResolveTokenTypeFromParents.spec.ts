import { describe, it, expect } from 'vitest';

import { recursivelyResolveTokenTypeFromParents } from '../../src/parser/token/recursivelyResolveTokenTypeFromParents';

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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      result.match({
        Ok: (x) => x,
        Error: () => null,
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'aSubGroup',
      'blue',
    ]);

    expect(
      result.match({
        Ok: (x) => x,
        Error: () => null,
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(
      result.match({
        Ok: (x) => x,
        Error: () => null,
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'Could not resolve $type from token up to root.',
    );
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toContain(
      'Invalid $type "invalid" at path: "aGroup.blue".',
    );
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aGroup',
      'blue',
    ]);

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'Invalid $type "invalid" for path: "aGroup.blue" while being resolved from root.',
    );
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

    const result = recursivelyResolveTokenTypeFromParents(tree, [
      'aLargerGroup',
      'aGroup',
      'blue',
    ]);

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'Invalid $type "invalid" for path: "aLargerGroup.aGroup.blue" while being resolved from "aLargerGroup".',
    );
  });
});
