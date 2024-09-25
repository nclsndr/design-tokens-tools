import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';

import { parseAliasableTransitionValue } from '../../../src/definitions/tokenTypes/transition';

describe.concurrent('parseAliasableTransitionValue', () => {
  it('should parse a raw transition value', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '100ms',
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: {
        duration: '100ms',
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      toReferences: [],
    });
  });
  it('should parse a transition value with a top level alias', () => {
    const result = parseAliasableTransitionValue('{transitions.b-transition}', {
      nodeId: 'abc',
      varName: 'transitions.a-transition',
      path: ['transitions', 'a-transition'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: '{transitions.b-transition}',
      toReferences: [
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: [],
          toTreePath: ['transitions', 'b-transition'],
        },
      ],
    });
  });
  it('should parse a transition value with nested aliases', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '{duration.fast}',
        delay: '{duration.none}',
        timingFunction: '{cubicBezier.easeInOut}',
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: {
        duration: '{duration.fast}',
        delay: '{duration.none}',
        timingFunction: '{cubicBezier.easeInOut}',
      },
      toReferences: [
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['duration'],
          toTreePath: ['duration', 'fast'],
        },
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['delay'],
          toTreePath: ['duration', 'none'],
        },
        {
          fromTreePath: ['transitions', 'a-transition'],
          fromValuePath: ['timingFunction'],
          toTreePath: ['cubicBezier', 'easeInOut'],
        },
      ],
    });
  });
  it('should fail when the value is not an object', () => {
    const result = parseAliasableTransitionValue('foo', {
      nodeId: 'abc',
      varName: 'transitions.a-transition',
      path: ['transitions', 'a-transition'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must be an object. Got "string".',
      },
    ]);
  });
  it('should fail when the duration property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        delay: '0ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must have a "duration" property.',
      },
    ]);
  });
  it('should fail when the delay property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '100ms',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message: 'transitions.a-transition must have a "delay" property.',
      },
    ]);
  });
  it('should fail when the timingFunction property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '100ms',
        delay: '0ms',
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['transitions', 'a-transition'],
        valuePath: [],
        message:
          'transitions.a-transition must have a "timingFunction" property.',
      },
    ]);
  });
});
