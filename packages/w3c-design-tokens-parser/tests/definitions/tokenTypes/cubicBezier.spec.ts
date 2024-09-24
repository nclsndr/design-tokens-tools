import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseCubicBezierRawValue } from '../../../src/definitions/tokenTypes/cubicBezier';

describe('parseCubicBezierRawValue', () => {
  it('should parse a valid cubic bezier', () => {
    const program = parseCubicBezierRawValue([0.1, 0.2, 0.3, 0.4], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: [0.1, 0.2, 0.3, 0.4],
      toReferences: [],
    });
  });
  it('should fail parsing a non-array value', () => {
    const program = parseCubicBezierRawValue('foo', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
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
    const program = parseCubicBezierRawValue([1, 2, 3], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
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
    const program = parseCubicBezierRawValue(['foo', 2, 0.2, 'qux'], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
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
    const program = parseCubicBezierRawValue([-42, 2, 42, 1.2], {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
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
