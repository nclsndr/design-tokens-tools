import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { ValidationError } from '../../src/utils/validationError';
import { AnalyzedValue } from '../../src/parser/token/AnalyzedToken';
import { AnalyzerContext } from '../../src/parser/utils/AnalyzerContext';
import { withAlias } from '../../src/definitions/withAlias';

describe.concurrent('withAlias', () => {
  it('should wrap a parser to allow the union with alias signature', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Effect.Effect<AnalyzedValue<boolean>, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Effect.fail([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Effect.succeed({
        raw: value,
        toReferences: [],
      });
    }

    const parseBool = withAlias(isBool);

    const result1 = parseBool('{my.alias}', {
      varName: 'alias',
      valuePath: [],
      nodeId: 'abc',
      path: ['alias'],
    });

    expect(
      Exit.match(Effect.runSyncExit(result1), {
        onSuccess: (result) => result,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
      raw: '{my.alias}',
      toReferences: [
        {
          fromTreePath: ['alias'],
          fromValuePath: [],
          toTreePath: ['my', 'alias'],
        },
      ],
    });

    const result2 = parseBool(true, {
      varName: 'bool',
      valuePath: [],
      nodeId: 'abc',
      path: ['bool'],
    });

    expect(
      Exit.match(Effect.runSyncExit(result2), {
        onSuccess: (result) => result,
        onFailure: () => undefined,
      }),
    ).toStrictEqual({
      raw: true,
      toReferences: [],
    });
  });
  it('should fail when the parsed data satisfy none of the branches', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Effect.Effect<any, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Effect.fail([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Effect.succeed(value);
    }

    const parseBool = withAlias(isBool);

    const result1 = parseBool(42, {
      varName: 'aReferencingToken',
      nodeId: 'abc',
      path: ['aReferencingToken'],
      valuePath: [],
    });

    const result1Errors = Exit.match(Effect.runSyncExit(result1), {
      onSuccess: () => undefined,
      onFailure: (cause) =>
        Cause.match(cause, {
          onEmpty: undefined,
          onFail: (errors) => errors,
          onDie: () => undefined,
          onInterrupt: () => undefined,
          onSequential: () => undefined,
          onParallel: () => undefined,
        }),
    });

    expect(result1Errors).toHaveLength(1);
    expect(result1Errors![0].message).toBe(
      'aReferencingToken must be a boolean. Got "number".',
    );

    const result2 = parseBool('a string', {
      varName: 'bool',
      valuePath: [],
      nodeId: 'abc',
      path: ['bool'],
    });
    const result2Errors = Exit.match(Effect.runSyncExit(result2), {
      onSuccess: () => undefined,
      onFailure: (cause) =>
        Cause.match(cause, {
          onEmpty: undefined,
          onFail: (errors) => errors,
          onDie: () => undefined,
          onInterrupt: () => undefined,
          onSequential: () => undefined,
          onParallel: () => undefined,
        }),
    });

    expect(result2Errors).toHaveLength(1);
    expect(result2Errors![0].message).toBe(
      'bool must be a boolean. Got "string".',
    );
  });
});
