import { describe, it, expect } from 'vitest';

import { parseAliasableGradientValue } from '../../../src/definitions/tokenTypes/gradient';

describe.concurrent('parseAliasableGradientValue', () => {
  it('should parse a valid gradient', () => {
    const result = parseAliasableGradientValue(
      [
        { position: 0, color: '#000000' },
        { position: 1, color: '#ffffff' },
      ],
      {
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => ({}),
      }),
    ).toStrictEqual({
      raw: [
        { position: 0, color: '#000000' },
        { position: 1, color: '#ffffff' },
      ],
      toReferences: [],
    });
  });
  it('should parse a gradient with a top level alias', () => {
    const result = parseAliasableGradientValue('{gradients.foo}', {
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).value.raw).toStrictEqual('{gradients.foo}');
    expect((result as any).value.toReferences).toStrictEqual([
      {
        fromTreePath: ['foo'],
        fromValuePath: [],
        toTreePath: ['gradients', 'foo'],
      },
    ]);
  });
  it('should parse a gradient with nested aliases', () => {
    const result = parseAliasableGradientValue(
      [
        { position: '{gradients.stop.1}', color: '{colors.red}' },
        { position: '{gradients.stop.2}', color: '{colors.blue}' },
      ],
      {
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect((result as any).value.raw).toStrictEqual([
      { position: '{gradients.stop.1}', color: '{colors.red}' },
      { position: '{gradients.stop.2}', color: '{colors.blue}' },
    ]);
    expect((result as any).value.toReferences).toHaveLength(4);
    expect((result as any).value.toReferences).toStrictEqual([
      {
        fromTreePath: ['foo'],
        toTreePath: ['colors', 'red'],
        fromValuePath: [0, 'color'],
      },
      {
        fromTreePath: ['foo'],
        toTreePath: ['gradients', 'stop', '1'],
        fromValuePath: [0, 'position'],
      },
      {
        fromTreePath: ['foo'],
        toTreePath: ['colors', 'blue'],
        fromValuePath: [1, 'color'],
      },
      {
        fromTreePath: ['foo'],
        toTreePath: ['gradients', 'stop', '2'],
        fromValuePath: [1, 'position'],
      },
    ]);
  });
});
