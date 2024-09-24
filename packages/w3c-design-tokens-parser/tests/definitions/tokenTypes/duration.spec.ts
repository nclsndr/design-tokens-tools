import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseAliasableDurationValue } from '../../../src/definitions/tokenTypes/duration';

describe.concurrent('parseAliasableDurationValue', () => {
  it('should parse a valid duration', () => {
    const program = parseAliasableDurationValue('1ms', {
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
      raw: '1ms',
      toReferences: [],
    });
  });
  it('should fail to parse a duration without unit', () => {
    const program = parseAliasableDurationValue('1', {
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
        message: 'foo must be a number followed by "ms". Got: "1".',
      },
    ]);
  });
  it('should fail to parse a duration with "s" unit', () => {
    const program = parseAliasableDurationValue('1s', {
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
        message: 'foo must be a number followed by "ms". Got: "1s".',
      },
    ]);
  });
  it('should fail to parse a duration without value', () => {
    const program = parseAliasableDurationValue('ms', {
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
        message: 'foo must be a number followed by "ms". Got: "ms".',
      },
    ]);
  });
});
