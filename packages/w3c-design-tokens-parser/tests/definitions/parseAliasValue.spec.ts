import { describe, it, expect } from 'vitest';
import { Cause, Effect, Either, Exit, Option } from 'effect';

import { parseAliasValue } from '../../src/parser/alias/parseAliasValue';

describe.concurrent('parseAliasValue', () => {
  it('should parse a valid alias string value', () => {
    const result = parseAliasValue('{my.alias}', {
      nodeId: 'abc',
      varName: 'alias',
      valuePath: [],
      path: ['token'],
    });

    expect(Either.getOrThrow(result)).toBe('{my.alias}');
  });
  it('should fail to parse without heading brace', () => {
    const result = parseAliasValue('my.alias}', {
      nodeId: 'abc',
      varName: 'Value',
      valuePath: [],
      path: ['token'],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['token'],
        valuePath: [],
        message:
          'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "my.alias}".',
      },
    ]);
  });
  it('should fail to parse without trailing brace', () => {
    const result = parseAliasValue('{my.alias', {
      nodeId: 'abc',
      varName: 'Value',
      valuePath: [],
      path: ['token'],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['token'],
        valuePath: [],
        message:
          'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "{my.alias".',
      },
    ]);
  });
});
