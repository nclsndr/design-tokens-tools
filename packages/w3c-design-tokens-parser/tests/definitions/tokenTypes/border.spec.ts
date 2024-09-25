import { describe, it, expect } from 'vitest';

import { parseAliasableBorderValue } from '../../../src/definitions/tokenTypes/border';
import { Either, Option } from 'effect';

describe.concurrent('parseAliasableBorderValue', () => {
  it('should parse a raw border value', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#FF5564',
        width: '1px',
        style: 'solid',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: {
        color: '#FF5564',
        width: '1px',
        style: 'solid',
      },
      toReferences: [],
    });
  });
  it('should parse an aliased value', () => {
    const result = parseAliasableBorderValue('{borders.b-border}', {
      nodeId: 'abc',
      varName: 'borders.a-border',
      path: ['borders', 'a-border'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: '{borders.b-border}',
      toReferences: [
        {
          fromTreePath: ['borders', 'a-border'],
          fromValuePath: [],
          toTreePath: ['borders', 'b-border'],
        },
      ],
    });
  });
  it('should parse a value with nested aliases', () => {
    const result = parseAliasableBorderValue(
      {
        color: '{color.primary}',
        width: '{space.regular}',
        style: '{border.property.solid}',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(Either.getOrThrow(result)).toStrictEqual({
      raw: {
        color: '{color.primary}',
        width: '{space.regular}',
        style: '{border.property.solid}',
      },
      toReferences: [
        {
          fromTreePath: ['borders', 'a-border'],
          fromValuePath: ['color'],
          toTreePath: ['color', 'primary'],
        },
        {
          fromTreePath: ['borders', 'a-border'],
          fromValuePath: ['width'],
          toTreePath: ['space', 'regular'],
        },
        {
          fromTreePath: ['borders', 'a-border'],
          fromValuePath: ['style'],
          toTreePath: ['border', 'property', 'solid'],
        },
      ],
    });
  });
  it('should fail when the value is not an object', () => {
    const result = parseAliasableBorderValue('not an object', {
      nodeId: 'abc',
      varName: 'borders.a-border',
      path: ['borders', 'a-border'],
      valuePath: [],
    });
    expect(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))).toBe(
      '[{"type":"Type","isCritical":false,"nodeId":"abc","treePath":["borders","a-border"],"valuePath":[],"message":"borders.a-border must be an object. Got \\"string\\"."}]',
    );
  });
  it('should fail whenever the color property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        width: '1px',
        style: 'solid',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))).toBe(
      '[{"type":"Value","isCritical":false,"nodeId":"abc","treePath":["borders","a-border"],"valuePath":[],"message":"borders.a-border must have a \\"color\\" property."}]',
    );
  });
  it('should fail whenever the width property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#000000',
        style: 'solid',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))).toBe(
      '[{"type":"Value","isCritical":false,"nodeId":"abc","treePath":["borders","a-border"],"valuePath":[],"message":"borders.a-border must have a \\"width\\" property."}]',
    );
  });
  it('should fail whenever the style property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#000000',
        width: '1px',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))).toBe(
      '[{"type":"Value","isCritical":false,"nodeId":"abc","treePath":["borders","a-border"],"valuePath":[],"message":"borders.a-border must have a \\"style\\" property."}]',
    );
  });
  it('should fail whenever the color property is not a valid Hex color', () => {
    const result = parseAliasableBorderValue(
      {
        color: 'not-a-color',
        width: '1px',
        style: 'solid',
      },
      {
        nodeId: 'abc',
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))).toBe(
      '[{"type":"Value","isCritical":false,"nodeId":"abc","treePath":["borders","a-border"],"valuePath":["color"],"message":"borders.a-border.color must start with \\"#\\" and have a length of 6 or 8. Got: \\"not-a-color\\"."}]',
    );
  });
});
