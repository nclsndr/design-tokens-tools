import { describe, it, expect } from 'vitest';

import { parseAliasableGradientValue } from '../../../src/definitions/tokenTypes/gradient';
import { Either, Option } from 'effect';

describe.concurrent('parseAliasableGradientValue', () => {
  it('should parse a valid gradient', () => {
    const result = parseAliasableGradientValue(
      [
        { position: 0, color: '#000000' },
        { position: 1, color: '#ffffff' },
      ],
      {
        nodeId: 'abc',
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: [
        { position: 0, color: '#000000' },
        { position: 1, color: '#ffffff' },
      ],
      toReferences: [],
    });
  });

  it('should parse a gradient with a top level alias', () => {
    const result = parseAliasableGradientValue('{gradients.foo}', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: '{gradients.foo}',
      toReferences: [
        {
          fromTreePath: ['foo'],
          fromValuePath: [],
          toTreePath: ['gradients', 'foo'],
        },
      ],
    });
  });
  it('should parse a gradient with nested aliases', () => {
    const result = parseAliasableGradientValue(
      [
        { color: '{colors.red}', position: '{gradients.stop.1}' },
        { position: '{gradients.stop.2}', color: '{colors.blue}' },
      ],
      {
        nodeId: 'abc',
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: [
        { position: '{gradients.stop.1}', color: '{colors.red}' },
        { position: '{gradients.stop.2}', color: '{colors.blue}' },
      ],
      toReferences: [
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
      ],
    });
  });
  it('should fail when the value is not an array', () => {
    const result = parseAliasableGradientValue('not an array', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        isCritical: false,
        type: 'Type',
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: `Gradient must be an array. Got "string".`,
      },
    ]);
  });
});
