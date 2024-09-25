import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';

import { parseCubicBezierRawValue } from '../../../src/definitions/tokenTypes/cubicBezier';

describe('parseCubicBezierRawValue', () => {
  it('should parse a valid cubic bezier', () => {
    const result = parseCubicBezierRawValue([0.1, 0.2, 0.3, 0.4], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: [0.1, 0.2, 0.3, 0.4],
      toReferences: [],
    });
  });
  it('should fail parsing a non-array value', () => {
    const result = parseCubicBezierRawValue('foo', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be an array of 4 numbers. Got "string".',
      },
    ]);
  });
  it('should fail parsing an array with the wrong length', () => {
    const result = parseCubicBezierRawValue([1, 2, 3], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be an array of 4 numbers. Got "object".',
      },
    ]);
  });
  it('should fail parsing an array with non-number values', () => {
    const result = parseCubicBezierRawValue(['foo', 2, 0.2, 'qux'], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo[0] must be a number. Got "string".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo[3] must be a number. Got "string".',
      },
    ]);
  });
  it('should fail parsing an array with out-of-range X values', () => {
    const result = parseCubicBezierRawValue([-42, 2, 42, 1.2], {
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
        message: 'foo[0] must be a number between 0 and 1. Got "-42".',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo[2] must be a number between 0 and 1. Got "42".',
      },
    ]);
  });
});
