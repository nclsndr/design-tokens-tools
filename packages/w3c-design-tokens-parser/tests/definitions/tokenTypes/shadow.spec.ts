import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import { parseAliasableShadowValue } from '../../../src/definitions/tokenTypes/shadow';

describe.concurrent('parseAliasableShadowValue', () => {
  it('should parse a raw shadow object value', () => {
    const program = parseAliasableShadowValue(
      {
        color: '#FF5564',
        offsetX: '1px',
        offsetY: '1px',
        blur: '1px',
        spread: '1px',
      },
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
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
        color: '#FF5564',
        offsetX: '1px',
        offsetY: '1px',
        blur: '1px',
        spread: '1px',
      },
      toReferences: [],
    });
  });
  it('should parse a raw shadow array value', () => {
    const program = parseAliasableShadowValue(
      [
        {
          color: '#FF5564',
          offsetX: '1px',
          offsetY: '1px',
          blur: '1px',
          spread: '1px',
        },
        {
          color: '#558bff',
          offsetX: '2px',
          offsetY: '2px',
          blur: '2px',
          spread: '2px',
        },
      ],
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: [
        {
          color: '#FF5564',
          offsetX: '1px',
          offsetY: '1px',
          blur: '1px',
          spread: '1px',
        },
        {
          color: '#558bff',
          offsetX: '2px',
          offsetY: '2px',
          blur: '2px',
          spread: '2px',
        },
      ],
      toReferences: [],
    });
  });
  it('should parse an aliased value', () => {
    const program = parseAliasableShadowValue('{shadows.b-shadow}', {
      nodeId: 'abc',
      varName: 'shadows.a-shadow',
      path: ['shadows', 'a-shadow'],
      valuePath: [],
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: '{shadows.b-shadow}',
      toReferences: [
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [],
          toTreePath: ['shadows', 'b-shadow'],
        },
      ],
    });
  });
  it('should parse an object value with nested aliases', () => {
    const program = parseAliasableShadowValue(
      {
        color: '{color.primary}',
        offsetX: '{space.regular}',
        offsetY: '{space.regular}',
        blur: '{space.regular}',
        spread: '{space.regular}',
      },
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
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
        color: '{color.primary}',
        offsetX: '{space.regular}',
        offsetY: '{space.regular}',
        blur: '{space.regular}',
        spread: '{space.regular}',
      },
      toReferences: [
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: ['color'],
          toTreePath: ['color', 'primary'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: ['offsetX'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: ['offsetY'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: ['blur'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: ['spread'],
          toTreePath: ['space', 'regular'],
        },
      ],
    });
  });
  it('should parse an array value with nested aliases', () => {
    const program = parseAliasableShadowValue(
      [
        {
          color: '{color.primary}',
          offsetX: '{space.regular}',
          offsetY: '{space.regular}',
          blur: '{space.regular}',
          spread: '{space.regular}',
        },
        {
          color: '{color.secondary}',
          offsetX: '{space.large}',
          offsetY: '{space.large}',
          blur: '{space.large}',
          spread: '{space.large}',
        },
      ],
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (result) => result,
        onFailure: (error) => error,
      }),
    ).toStrictEqual({
      raw: [
        {
          color: '{color.primary}',
          offsetX: '{space.regular}',
          offsetY: '{space.regular}',
          blur: '{space.regular}',
          spread: '{space.regular}',
        },
        {
          color: '{color.secondary}',
          offsetX: '{space.large}',
          offsetY: '{space.large}',
          blur: '{space.large}',
          spread: '{space.large}',
        },
      ],
      toReferences: [
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [0, 'color'],
          toTreePath: ['color', 'primary'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [0, 'offsetX'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [0, 'offsetY'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [0, 'blur'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [0, 'spread'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [1, 'color'],
          toTreePath: ['color', 'secondary'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [1, 'offsetX'],
          toTreePath: ['space', 'large'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [1, 'offsetY'],
          toTreePath: ['space', 'large'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [1, 'blur'],
          toTreePath: ['space', 'large'],
        },
        {
          fromTreePath: ['shadows', 'a-shadow'],
          fromValuePath: [1, 'spread'],
          toTreePath: ['space', 'large'],
        },
      ],
    });
  });
  it('should fail whenever the color property is missing on object', () => {
    const program = parseAliasableShadowValue(
      {
        offsetX: '1px',
        offsetY: '1px',
        blur: '1px',
        spread: '1px',
      },
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => undefined,
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
        isCritical: false,
        type: 'Value',
        nodeId: 'abc',
        treePath: ['shadows', 'a-shadow'],
        valuePath: [],
        message: 'shadows.a-shadow must have a "color" property.',
      },
    ]);
  });
  it('should fail whenever the color property is missing on array', () => {
    const program = parseAliasableShadowValue(
      [
        {
          offsetX: '1px',
          offsetY: '1px',
          blur: '1px',
          spread: '1px',
        },
      ],
      {
        nodeId: 'abc',
        varName: 'shadows.a-shadow',
        path: ['shadows', 'a-shadow'],
        valuePath: [],
      },
    );

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: () => undefined,
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
        isCritical: false,
        type: 'Value',
        nodeId: 'abc',
        treePath: ['shadows', 'a-shadow'],
        valuePath: [0],
        message: 'shadows.a-shadow[0] must have a "color" property.',
      },
    ]);
  });
});
