import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { makeParseObject } from '../../src/parser/utils/parseObject';

import { ValidationError } from '../../src/utils/validationError';

describe.concurrent('makeParseObject', () => {
  const validateObjectMock = makeParseObject({
    first: {
      parser: (v, ctx) => {
        if (typeof v !== 'boolean') {
          return Effect.fail([
            new ValidationError({
              type: 'Type',
              nodeId: ctx.nodeId,
              treePath: ctx.path,
              valuePath: ctx.valuePath,
              message: `${ctx.varName} must be a boolean. Got "${typeof v}".`,
            }),
          ]);
        }
        return Effect.succeed(v);
      },
    },
    second: {
      parser: (v, ctx) => {
        if (typeof v !== 'string') {
          return Effect.fail([
            new ValidationError({
              type: 'Type',
              nodeId: ctx.nodeId,
              treePath: ctx.path,
              valuePath: ctx.valuePath,
              message: `${ctx.varName} must be a string. Got "${typeof v}".`,
            }),
          ]);
        }
        return Effect.succeed(v);
      },
    },
  });

  it('should parse and type an object', () => {
    const program = validateObjectMock(
      {
        first: true,
        second: 'foo',
      },
      {
        varName: 'foo',
        path: ['foo'],
        nodeId: 'abc',
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
      first: true,
      second: 'foo',
    });
  });
  it('should fail when the candidate is not an object', () => {
    const program = validateObjectMock('foo', {
      varName: 'foo',
      path: ['foo'],
      nodeId: 'abc',
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => undefined,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: 'onEmpty',
            onFail: (e) => JSON.stringify(e),
            onDie: () => 'onDie',
            onInterrupt: () => 'onInterrupt',
            onSequential: () => 'onSequential',
            onParallel: () => 'onParallel',
          }),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["foo"],"valuePath":[],"message":"foo must be an object. Got \\"string\\"."}]',
    );
  });
  it('should fail when the candidate misses a mandatory property', () => {
    const program = validateObjectMock(
      {
        first: 'true',
      },
      {
        varName: 'foo',
        path: ['foo'],
        nodeId: 'abc',
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => undefined,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: 'onEmpty',
            onFail: (e) => JSON.stringify(e),
            onDie: () => 'onDie',
            onInterrupt: () => 'onInterrupt',
            onSequential: () => 'onSequential',
            onParallel: () => 'onParallel',
          }),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["foo"],"valuePath":["first"],"message":"foo.first must be a boolean. Got \\"string\\"."},{"type":"Value","isCritical":false,"nodeId":"abc","treePath":["foo"],"valuePath":[],"message":"foo must have a \\"second\\" property."}]',
    );
  });
  it('should fail when the candidate provides invalid values', () => {
    const program = validateObjectMock(
      {
        first: 'foo',
        second: 42,
      },
      {
        varName: 'foo',
        path: ['foo'],
        nodeId: 'abc',
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => undefined,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: 'onEmpty',
            onFail: (e) => JSON.stringify(e),
            onDie: () => 'onDie',
            onInterrupt: () => 'onInterrupt',
            onSequential: () => 'onSequential',
            onParallel: () => 'onParallel',
          }),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["foo"],"valuePath":["first"],"message":"foo.first must be a boolean. Got \\"string\\"."},{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["foo"],"valuePath":["second"],"message":"foo.second must be a string. Got \\"number\\"."}]',
    );
  });
});
