import { describe, it, expect } from 'vitest';

import { parseAliasableTransitionValue } from '../../../src/definitions/tokenTypes/transition';

describe.concurrent('parseAliasableTransitionValue', () => {
  it('should parse a raw transition value', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '1s',
        delay: '0s',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect((result as any).value).toStrictEqual({
      raw: {
        duration: '1s',
        delay: '0s',
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

    expect((result as any).value.raw).toStrictEqual(
      '{transitions.b-transition}',
    );
    expect((result as any).value.toReferences).toStrictEqual([
      {
        fromTreePath: ['transitions', 'a-transition'],
        fromValuePath: [],
        toTreePath: ['transitions', 'b-transition'],
      },
    ]);
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

    expect((result as any).value.raw).toStrictEqual({
      duration: '{duration.fast}',
      delay: '{duration.none}',
      timingFunction: '{cubicBezier.easeInOut}',
    });
    expect((result as any).value.toReferences).toStrictEqual([
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
    ]);
  });
  it('should fail when the value is not an object', () => {
    const result = parseAliasableTransitionValue('foo', {
      nodeId: 'abc',
      varName: 'transitions.a-transition',
      path: ['transitions', 'a-transition'],
      valuePath: [],
    });

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'transitions.a-transition must be an object. Got "string".',
    );
  });
  it('should fail when the duration property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        delay: '0s',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'transitions.a-transition must have a "duration" property.',
    );
  });
  it('should fail when the delay property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '1s',
        timingFunction: [0, 0, 1, 1],
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'transitions.a-transition must have a "delay" property.',
    );
  });
  it('should fail when the timingFunction property is missing', () => {
    const result = parseAliasableTransitionValue(
      {
        duration: '1s',
        delay: '0s',
      },
      {
        nodeId: 'abc',
        varName: 'transitions.a-transition',
        path: ['transitions', 'a-transition'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'transitions.a-transition must have a "timingFunction" property.',
    );
  });
});
