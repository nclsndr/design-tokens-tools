import { describe, it, expect } from 'vitest';
import { Cause, Effect, Exit } from 'effect';

import {
  parseAliasableStrokeStyleValue,
  strokeStyleStringValues,
} from '../../../src/definitions/tokenTypes/strokeStyle';

describe.concurrent('parseRawStrokeStyleValue', () => {
  it('should parse string value', () => {
    for (const value of strokeStyleStringValues) {
      expect(
        Exit.match(
          Effect.runSyncExit(
            parseAliasableStrokeStyleValue(value, {
              valuePath: [],
              path: ['test'],
              nodeId: 'abc',
              varName: 'test',
            }),
          ),
          {
            onSuccess: (result) => result,
            onFailure: () => undefined,
          },
        ),
      ).toStrictEqual({
        raw: value,
        toReferences: [],
      });
    }
  });
  it('should parse string value with alias', () => {
    const value = '{my.var}';

    expect(
      Exit.match(
        Effect.runSyncExit(
          parseAliasableStrokeStyleValue(value, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
        ),
        {
          onSuccess: (result) => result,
          onFailure: () => undefined,
        },
      ),
    ).toStrictEqual({
      raw: value,
      toReferences: [
        {
          fromTreePath: ['test'],
          fromValuePath: [],
          toTreePath: ['my', 'var'],
        },
      ],
    });
  });
  it('should parse object values with alias', () => {
    const value = {
      dashArray: ['12px', '4px', '{my.var}'],
      lineCap: 'round',
    };

    expect(
      Exit.match(
        Effect.runSyncExit(
          parseAliasableStrokeStyleValue(value, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
        ),
        {
          onSuccess: (result) => result,
          onFailure: () => undefined,
        },
      ),
    ).toStrictEqual({
      raw: value,
      toReferences: [
        {
          fromTreePath: ['test'],
          fromValuePath: ['dashArray', 2],
          toTreePath: ['my', 'var'],
        },
      ],
    });
  });

  it('should fail when the value is nor a string or an object', () => {
    expect(
      Exit.match(
        Effect.runSyncExit(
          parseAliasableStrokeStyleValue(42, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
        ),
        {
          onSuccess: () => undefined,
          onFailure: (cause) =>
            Cause.match(cause, {
              onEmpty: undefined,
              onFail: (errors) => JSON.stringify(errors),
              onDie: () => undefined,
              onInterrupt: () => undefined,
              onSequential: () => undefined,
              onParallel: () => undefined,
            }),
        },
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"number\\"."}]',
    );

    expect(
      Exit.match(
        Effect.runSyncExit(
          parseAliasableStrokeStyleValue(true, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
        ),
        {
          onSuccess: () => undefined,
          onFailure: (cause) =>
            Cause.match(cause, {
              onEmpty: undefined,
              onFail: (errors) => JSON.stringify(errors),
              onDie: () => undefined,
              onInterrupt: () => undefined,
              onSequential: () => undefined,
              onParallel: () => undefined,
            }),
        },
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"boolean\\"."}]',
    );

    expect(
      Exit.match(
        Effect.runSyncExit(
          parseAliasableStrokeStyleValue(null, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
        ),
        {
          onSuccess: () => undefined,
          onFailure: (cause) =>
            Cause.match(cause, {
              onEmpty: undefined,
              onFail: (errors) => JSON.stringify(errors),
              onDie: () => undefined,
              onInterrupt: () => undefined,
              onSequential: () => undefined,
              onParallel: () => undefined,
            }),
        },
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"object\\"."}]',
    );
  });
});
