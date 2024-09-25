import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';

import {
  parseAliasableStrokeStyleValue,
  strokeStyleStringValues,
} from '../../../src/definitions/tokenTypes/strokeStyle';

describe.concurrent('parseRawStrokeStyleValue', () => {
  it('should parse string value', () => {
    for (const value of strokeStyleStringValues) {
      expect(
        Either.getOrThrow(
          parseAliasableStrokeStyleValue(value, {
            valuePath: [],
            path: ['test'],
            nodeId: 'abc',
            varName: 'test',
          }),
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
      Either.getOrThrow(
        parseAliasableStrokeStyleValue(value, {
          valuePath: [],
          path: ['test'],
          nodeId: 'abc',
          varName: 'test',
        }),
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
      Either.getOrThrow(
        parseAliasableStrokeStyleValue(value, {
          valuePath: [],
          path: ['test'],
          nodeId: 'abc',
          varName: 'test',
        }),
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
      JSON.stringify(
        Option.getOrThrow(
          Either.getLeft(
            parseAliasableStrokeStyleValue(42, {
              valuePath: [],
              path: ['test'],
              nodeId: 'abc',
              varName: 'test',
            }),
          ),
        ),
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"number\\"."}]',
    );

    expect(
      JSON.stringify(
        Option.getOrThrow(
          Either.getLeft(
            parseAliasableStrokeStyleValue(true, {
              valuePath: [],
              path: ['test'],
              nodeId: 'abc',
              varName: 'test',
            }),
          ),
        ),
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"boolean\\"."}]',
    );

    expect(
      JSON.stringify(
        Option.getOrThrow(
          Either.getLeft(
            parseAliasableStrokeStyleValue(null, {
              valuePath: [],
              path: ['test'],
              nodeId: 'abc',
              varName: 'test',
            }),
          ),
        ),
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"object\\"."}]',
    );
  });
});
