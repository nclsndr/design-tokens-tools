import { describe, it, expect } from 'vitest';

import { parseAliasableBorderValue } from '../../../src/definitions/tokenTypes/border';

describe.concurrent('parseAliasableBorderValue', () => {
  it('should parse a raw border value', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#FF5564',
        width: '1px',
        style: 'solid',
      },
      {
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).value).toStrictEqual({
      raw: {
        color: '#FF5564',
        width: '1px',
        style: 'solid',
      },
      toReferences: [],
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
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).value.raw).toStrictEqual({
      color: '{color.primary}',
      width: '{space.regular}',
      style: '{border.property.solid}',
    });

    expect((result as any).value.toReferences).toStrictEqual([
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
    ]);
  });
  it('should fail when the value is not an object', () => {
    expect(
      (
        parseAliasableBorderValue('not an object', {
          varName: 'borders.a-border',
          path: ['borders', 'a-border'],
          valuePath: [],
        }) as any
      ).error[0].message,
    ).toBe('borders.a-border must be an object. Got "string".');
  });
  it('should fail whenever the color property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        width: '1px',
        style: 'solid',
      },
      {
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'borders.a-border must have a "color" property.',
    );
  });
  it('should fail whenever the width property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#000000',
        style: 'solid',
      },
      {
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'borders.a-border must have a "width" property.',
    );
  });
  it('should fail whenever the style property is missing', () => {
    const result = parseAliasableBorderValue(
      {
        color: '#000000',
        width: '1px',
      },
      {
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'borders.a-border must have a "style" property.',
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
        varName: 'borders.a-border',
        path: ['borders', 'a-border'],
        valuePath: [],
      },
    );

    expect((result as any).error).toHaveLength(1);
    expect((result as any).error[0].message).toBe(
      'borders.a-border.color must start with "#" and have a length of 6 or 8. Got: "not-a-color".',
    );
  });
});
