import { describe, it, expect } from 'vitest';

import { parseCubicBezierRawValue } from '../../../src/definitions/tokenTypes/cubicBezier';

describe('parseCubicBezierRawValue', () => {
  it('should parse a valid cubic bezier', () => {
    const result = parseCubicBezierRawValue([0.1, 0.2, 0.3, 0.4], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).value).toEqual({
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

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'foo must be an array of 4 numbers. Got "string".',
    );
  });
  it('should fail parsing an array with the wrong length', () => {
    const result = parseCubicBezierRawValue([1, 2, 3], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'foo must be an array of 4 numbers. Got "object".',
    );
  });
  it('should fail parsing an array with non-number values', () => {
    const result = parseCubicBezierRawValue(['foo', 2, 0.2, 'qux'], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).error).toHaveLength(2);
    expect((result as any).error[0].message).toBe(
      'foo[0] must be a number. Got "string".',
    );
    expect((result as any).error[1].message).toBe(
      'foo[3] must be a number. Got "string".',
    );
  });
  it('should fail parsing an array with out-of-range X values', () => {
    const result = parseCubicBezierRawValue([-42, 2, 42, 1.2], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).error).toHaveLength(2);
    expect((result as any).error[0].message).toBe(
      'foo[0] must be a number between 0 and 1. Got "-42".',
    );
    expect((result as any).error[1].message).toBe(
      'foo[2] must be a number between 0 and 1. Got "42".',
    );
  });
});
