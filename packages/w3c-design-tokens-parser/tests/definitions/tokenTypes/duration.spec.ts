import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';

import { parseAliasableDurationValue } from '../../../src/definitions/tokenTypes/duration';

describe.concurrent('parseAliasableDurationValue', () => {
  it('should parse a valid duration', () => {
    const result = parseAliasableDurationValue('1ms', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: '1ms',
      toReferences: [],
    });
  });
  it('should fail to parse a duration without unit', () => {
    const result = parseAliasableDurationValue('1', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be a number followed by "ms". Got: "1".',
      },
    ]);
  });
  it('should fail to parse a duration with "s" unit', () => {
    const result = parseAliasableDurationValue('1s', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be a number followed by "ms". Got: "1s".',
      },
    ]);
  });
  it('should fail to parse a duration without value', () => {
    const result = parseAliasableDurationValue('ms', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be a number followed by "ms". Got: "ms".',
      },
    ]);
  });
});
