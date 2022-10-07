import { describe, it, expect } from 'vitest';
import { makeParseObject } from '../../src/parser/internals/parseObject';
import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../src/utils/validationError';

describe.concurrent('makeParseObject', () => {
  const validateObjectMock = makeParseObject({
    first: {
      parser: (v, ctx) => {
        if (typeof v === 'boolean') {
          return Result.Ok(v);
        }
        return Result.Error([
          new ValidationError({
            type: 'Type',
            treePath: ctx.path,
            valuePath: ctx.valuePath,
            message: `${ctx.varName} must be a boolean. Got "${typeof v}".`,
          }),
        ]);
      },
    },
    second: {
      parser: (v, ctx) => {
        if (typeof v !== 'string') {
          return Result.Error([
            new ValidationError({
              type: 'Type',
              treePath: ctx.path,
              valuePath: ctx.valuePath,
              message: `${ctx.varName} must be a string. Got "${typeof v}".`,
            }),
          ]);
        }
        return Result.Ok(v);
      },
    },
  });

  it('should parse and type an object', () => {
    const result = validateObjectMock(
      {
        first: true,
        second: 'foo',
      },
      {
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => ({}),
      }),
    ).toStrictEqual({
      first: true,
      second: 'foo',
    });
  });
  it('should fail when the candidate is not an object', () => {
    const result = validateObjectMock('foo', {
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect(
      result.match({
        Ok: (_) => ({}),
        Error: (errors) => JSON.stringify(errors),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["foo"],"valuePath":[],"message":"foo must be an object. Got \\"string\\"."}]',
    );
  });
  it('should fail when the candidate misses a mandatory property', () => {
    const result = validateObjectMock(
      {
        first: true,
      },
      {
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(
      result.match({
        Ok: (_) => ({}),
        Error: (errors) => JSON.stringify(errors),
      }),
    ).toStrictEqual(
      '[{"type":"Value","isCritical":false,"treePath":["foo"],"valuePath":[],"message":"foo must have a \\"second\\" property."}]',
    );
  });
  it('should fail when the candidate provides invalid values', () => {
    const result = validateObjectMock(
      {
        first: 'foo',
        second: 42,
      },
      {
        varName: 'foo',
        path: ['foo'],
        valuePath: [],
      },
    );

    expect(
      result.match({
        Ok: (_) => ({}),
        Error: (errors) => JSON.stringify(errors),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["foo"],"valuePath":["first"],"message":"foo.first must be a boolean. Got \\"string\\"."},{"type":"Type","isCritical":false,"treePath":["foo"],"valuePath":["second"],"message":"foo.second must be a string. Got \\"number\\"."}]',
    );
  });
});
