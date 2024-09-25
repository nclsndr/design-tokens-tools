import { describe, it, expect } from 'vitest';
import { Cause, Effect, Either, Exit, Option } from 'effect';

import { ValidationError } from '../../src/utils/validationError';
import { AnalyzedValue } from '../../src/parser/token/AnalyzedToken';
import { AnalyzerContext } from '../../src/parser/utils/AnalyzerContext';
import { withAlias } from '../../src/definitions/withAlias';

describe.concurrent('withAlias', () => {
  it('should wrap a parser to allow the union with alias signature', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Either.Either<AnalyzedValue<boolean>, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Either.left([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Either.right({
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

    expect(Either.getOrThrow(result1)).toStrictEqual({
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

    expect(Either.getOrThrow(result2)).toStrictEqual({
      raw: true,
      toReferences: [],
    });
  });
  it('should fail when the parsed data satisfy none of the branches', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Either.Either<AnalyzedValue<boolean>, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Either.left([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Either.right({
        raw: value,
        toReferences: [],
      });
    }

    const parseBool = withAlias(isBool);

    const result1 = parseBool(42, {
      varName: 'aReferencingToken',
      nodeId: 'abc',
      path: ['aReferencingToken'],
      valuePath: [],
    });

    const result1Errors = Option.getOrThrow(Either.getLeft(result1));

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
    const result2Errors = Option.getOrThrow(Either.getLeft(result2));

    expect(result2Errors).toHaveLength(1);
    expect(result2Errors![0].message).toBe(
      'bool must be a boolean. Got "string".',
    );
  });
});
