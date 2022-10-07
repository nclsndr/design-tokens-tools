import { describe, it, expect } from 'vitest';

import {
  parseAliasableStrokeStyleValue,
  strokeStyleStringValues,
} from '../../../src/definitions/tokenTypes/strokeStyle';

describe.concurrent('parseRawStrokeStyleValue', () => {
  it('should parse string value', () => {
    for (const value of strokeStyleStringValues) {
      expect(
        (
          parseAliasableStrokeStyleValue(value, {
            valuePath: [],
            path: ['test'],
            varName: 'test',
          }) as any
        ).value,
      ).toStrictEqual({
        raw: value,
        toReferences: [],
      });
    }
  });
  it('should parse string value with alias', () => {
    const value = '{my.var}';

    expect(
      (
        parseAliasableStrokeStyleValue(value, {
          valuePath: [],
          path: ['test'],
          varName: 'test',
        }) as any
      ).value,
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
      (
        parseAliasableStrokeStyleValue(value, {
          valuePath: [],
          path: ['test'],
          varName: 'test',
        }) as any
      ).value,
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
        (
          parseAliasableStrokeStyleValue(42, {
            valuePath: [],
            path: ['test'],
            varName: 'test',
          }) as any
        ).error,
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"number\\"."}]',
    );

    expect(
      JSON.stringify(
        (
          parseAliasableStrokeStyleValue(true, {
            valuePath: [],
            path: ['test'],
            varName: 'test',
          }) as any
        ).error,
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"boolean\\"."}]',
    );

    expect(
      JSON.stringify(
        (
          parseAliasableStrokeStyleValue(null, {
            valuePath: [],
            path: ['test'],
            varName: 'test',
          }) as any
        ).error,
      ),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["test"],"valuePath":[],"message":"test must be a string or an object. Got \\"object\\"."}]',
    );
  });
});
