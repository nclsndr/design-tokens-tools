import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';
import { ValidationError } from '@nclsndr/design-tokens-utils';

import { makeParseObject } from '../../src/parser/utils/parseObject';

describe.concurrent('makeParseObject', () => {
  const validateObjectMock = makeParseObject({
    first: {
      parser: (v, ctx) => {
        if (typeof v !== 'boolean') {
          return Either.left([
            new ValidationError({
              type: 'Type',
              nodeId: ctx.nodeId,
              treePath: ctx.path,
              valuePath: ctx.valuePath,
              message: `${ctx.varName} must be a boolean. Got "${typeof v}".`,
            }),
          ]);
        }
        return Either.right(v);
      },
    },
    second: {
      parser: (v, ctx) => {
        if (typeof v !== 'string') {
          return Either.left([
            new ValidationError({
              type: 'Type',
              nodeId: ctx.nodeId,
              treePath: ctx.path,
              valuePath: ctx.valuePath,
              message: `${ctx.varName} must be a string. Got "${typeof v}".`,
            }),
          ]);
        }
        return Either.right(v);
      },
    },
  });

  it('should parse and type an object', () => {
    const eitherResult = validateObjectMock(
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

    expect(Either.getOrThrow(eitherResult)).toStrictEqual({
      first: true,
      second: 'foo',
    });
  });
  it('should fail when the candidate is not an object', () => {
    const eitherResult = validateObjectMock('foo', {
      varName: 'foo',
      path: ['foo'],
      nodeId: 'abc',
      valuePath: [],
    });

    expect(
      JSON.parse(
        JSON.stringify(Option.getOrThrow(Either.getLeft(eitherResult))),
      ),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be an object. Got "string".',
      },
    ]);
  });
  it('should fail when the candidate misses a mandatory property', () => {
    const eitherResult = validateObjectMock(
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
      JSON.parse(
        JSON.stringify(Option.getOrThrow(Either.getLeft(eitherResult))),
      ),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['first'],
        message: 'foo.first must be a boolean. Got "string".',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must have a "second" property.',
      },
    ]);
  });
  it('should fail when the candidate provides invalid values', () => {
    const eitherResult = validateObjectMock(
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
      JSON.parse(
        JSON.stringify(Option.getOrThrow(Either.getLeft(eitherResult))),
      ),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['first'],
        message: 'foo.first must be a boolean. Got "string".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['second'],
        message: 'foo.second must be a string. Got "number".',
      },
    ]);
  });
});
