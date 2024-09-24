import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseAliasValue } from '../../src/parser/alias/parseAliasValue';

describe.concurrent('parseAliasValue', () => {
  it('should parse a valid alias string value', () => {
    const program = parseAliasValue('{my.alias}', {
      nodeId: 'abc',
      varName: 'alias',
      valuePath: [],
      path: ['token'],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (value) => value,
        onFailure: (error) => {
          throw error;
        },
      }),
    ).toBe('{my.alias}');
  });
  it('should fail to parse without heading brace', () => {
    const program = parseAliasValue('my.alias}', {
      nodeId: 'abc',
      varName: 'Value',
      valuePath: [],
      path: ['token'],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (value) => value,
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
        treePath: ['token'],
        valuePath: [],
        message:
          'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "my.alias}".',
      },
    ]);
  });
  it('should fail to parse without trailing brace', () => {
    const program = parseAliasValue('{my.alias', {
      nodeId: 'abc',
      varName: 'Value',
      valuePath: [],
      path: ['token'],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (value) => value,
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
        treePath: ['token'],
        valuePath: [],
        message:
          'Value must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "{my.alias".',
      },
    ]);
  });
});
