import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseAliasableTransitionValue } from '../../../src/definitions/tokenTypes/transition';

describe.concurrent('parseAliasableTransitionValue', () => {
  it('should parse a raw transition value', () => {
    const program = parseAliasableTransitionValue(
      {
        duration: '100ms',
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: {
        duration: '100ms',
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      toReferences: [],
    });
  });
  it('should parse a transition value with a top level alias', () => {
    const program = parseAliasableTransitionValue(
      '{transitions.b-transition}',
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: '{transitions.b-transition}',
      toReferences: [
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: [],
          toTreePath: ['transitions', 'b-transition'],
        },
      ],
    });
  });
  it('should parse a transition value with nested aliases', () => {
    const program = parseAliasableTransitionValue(
      {
        duration: '{duration.fast}',
        delay: '{duration.none}',
        timingFunction: '{cubicBezier.easeInOut}',
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: {
        duration: '{duration.fast}',
        delay: '{duration.none}',
        timingFunction: '{cubicBezier.easeInOut}',
      },
      toReferences: [
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['duration'],
          toTreePath: ['duration', 'fast'],
        },
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['delay'],
          toTreePath: ['duration', 'none'],
        },
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['timingFunction'],
          toTreePath: ['cubicBezier', 'easeInOut'],
        },
      ],
    });
  });
  it('should fail when the value is not an object', () => {
    const program = parseAliasableTransitionValue('foo', {
      nodeId: 'abc',
      varName: 'transitions.a-transition',
      path: ['transitions', 'a-transition'],
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
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must be an object. Got "string".',
      },
    ]);
  });
  it('should fail when the duration property is missing', () => {
    const program = parseAliasableTransitionValue(
      {
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

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
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must have a "duration" property.',
      },
    ]);
  });
  it('should fail when the delay property is missing', () => {
    const program = parseAliasableTransitionValue(
      {
        duration: '100ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

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
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must have a "delay" property.',
      },
    ]);
  });
  it('should fail when the timingFunction property is missing', () => {
    const program = parseAliasableTransitionValue(
      {
        duration: '100ms',
        delay: '0ms',
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

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
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message:
          'transitions.a-transition must have a "timingFunction" property.',
      },
    ]);
  });
});
