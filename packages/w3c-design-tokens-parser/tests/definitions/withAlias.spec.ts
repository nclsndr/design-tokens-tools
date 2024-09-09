import { describe, it, expect } from 'vitest';
import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../src/utils/validationError';
import { AnalyzedValue } from '../../src/parser/token/AnalyzedToken';
import { AnalyzerContext } from '../../src/parser/utils/AnalyzerContext';
import { withAlias } from '../../src/definitions/withAlias';

describe.concurrent('withAlias', () => {
  it('should wrap a parser to allow the union with alias signature', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Result<AnalyzedValue<boolean>, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Result.Error([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Result.Ok({
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

    expect(result1.isOk()).toBe(true);
    expect(result1.isOk() && result1.get().raw).toEqual('{my.alias}');
    expect(result1.isOk() && result1.get().toReferences).toHaveLength(1);
    expect(
      result1.isOk() && result1.get().toReferences[0].toTreePath,
    ).toStrictEqual(['my', 'alias']);
    expect(
      result1.isOk() && result1.get().toReferences[0].fromTreePath,
    ).toStrictEqual(['alias']);

    const result2 = parseBool(true, {
      varName: 'bool',
      valuePath: [],
      nodeId: 'abc',
      path: ['bool'],
    });

    expect(result2.isOk()).toBe(true);
    expect(result2.isOk() && result2.get()).toStrictEqual({
      raw: true,
      toReferences: [],
    });
  });
  it('should fail when the parsed data satisfy neither of the branches', () => {
    function isBool(
      value: unknown,
      ctx: AnalyzerContext,
    ): Result<any, ValidationError[]> {
      if (typeof value !== 'boolean') {
        return Result.Error([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            message: `${ctx.varName} must be a boolean. Got "${typeof value}".`,
          }),
        ]);
      }

      return Result.Ok(value);
    }

    const parseBool = withAlias(isBool);

    const result1 = parseBool(42, {
      varName: 'aReferencingToken',
      nodeId: 'abc',
      path: ['aReferencingToken'],
      valuePath: [],
    });

    expect(result1.isError()).toBe(true);
    expect(result1.isError() && result1.getError()).toHaveLength(1);
    expect(result1.isError() && result1.getError()[0].message).toBe(
      'aReferencingToken must be a boolean. Got "number".',
    );

    const result2 = parseBool('a string', {
      varName: 'bool',
      valuePath: [],
      nodeId: 'abc',
      path: ['bool'],
    });

    expect(result2.isError()).toBe(true);
    expect(result2.isError() && result2.getError()).toHaveLength(1);
  });
});
