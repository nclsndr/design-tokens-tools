import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseAliasableTypographyValue } from '../../../src/definitions/tokenTypes/typography';

describe.concurrent('parseAliasableTypographyValue', () => {
  it('should parse a valid typography value', () => {
    const program = parseAliasableTypographyValue(
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: 1.5,
        letterSpacing: '0.5px',
      },
      {
        nodeId: 'abc',
        varName: 'foo',
        path: ['foo'],
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
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: 1.5,
        letterSpacing: '0.5px',
      },
      toReferences: [],
    });
  });
  it('should parse a typography value with a top level alias', () => {
    const program = parseAliasableTypographyValue('{typography.foo}', {
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
      raw: '{typography.foo}',
      toReferences: [
        {
          fromTreePath: ['foo'],
          toTreePath: ['typography', 'foo'],
          fromValuePath: [],
        },
      ],
    });
  });
  it('should parse a typography value with nested aliases', () => {
    const program = parseAliasableTypographyValue(
      {
        fontFamily: '{fonts.foo}',
        fontSize: '{fontSize.foo}',
        fontWeight: '{fontWeight.foo}',
        lineHeight: '{lineHeight.foo}',
        letterSpacing: '{letterSpacing.foo}',
      },
      {
        nodeId: 'abc',
        varName: 'foo',
        path: ['foo'],
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
        fontFamily: '{fonts.foo}',
        fontSize: '{fontSize.foo}',
        fontWeight: '{fontWeight.foo}',
        lineHeight: '{lineHeight.foo}',
        letterSpacing: '{letterSpacing.foo}',
      },
      toReferences: [
        {
          fromTreePath: ['foo'],
          toTreePath: ['fonts', 'foo'],
          fromValuePath: ['fontFamily'],
        },
        {
          fromTreePath: ['foo'],
          toTreePath: ['fontSize', 'foo'],
          fromValuePath: ['fontSize'],
        },
        {
          fromTreePath: ['foo'],
          toTreePath: ['fontWeight', 'foo'],
          fromValuePath: ['fontWeight'],
        },
        {
          fromTreePath: ['foo'],
          toTreePath: ['letterSpacing', 'foo'],
          fromValuePath: ['letterSpacing'],
        },
        {
          fromTreePath: ['foo'],
          toTreePath: ['lineHeight', 'foo'],
          fromValuePath: ['lineHeight'],
        },
      ],
    });
  });
  it('should fail when the value is not an object', () => {
    const program = parseAliasableTypographyValue('foo', {
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
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: [],
        message: 'foo must be an object. Got "string".',
      },
    ]);
  });
  it('should fail when the object properties are invalid', () => {
    const program = parseAliasableTypographyValue(
      {
        fontFamily: true,
        fontSize: false,
        fontWeight: null,
        lineHeight: 'invalid',
        letterSpacing: 'invalid',
      },
      {
        nodeId: 'abc',
        varName: 'foo',
        path: ['foo'],
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
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['fontFamily'],
        message:
          'foo.fontFamily must be a string or an array of strings. Got "boolean".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['fontSize'],
        message: 'foo.fontSize must be a string. Got "boolean".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['fontWeight'],
        message: 'foo.fontWeight must be a string or number. Got "object".',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['letterSpacing'],
        message:
          'foo.letterSpacing must be a number followed by "px" or "rem". Got: "invalid".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['foo'],
        valuePath: ['lineHeight'],
        message: 'foo.lineHeight must be a number. Got "string".',
      },
    ]);
  });
});
