import { describe, it, expect } from 'vitest';
import { parseAliasableShadowValue } from '../../../src/definitions/tokenTypes/shadow';

describe.concurrent('parseAliasableShadowValue', () => {
  it('should parse a raw shadow object value', () => {
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: (value) => value,
      Error: (err) => {
        throw new Error(err.map((e) => e.message).join('\n'));
      },
    });

    expect(result).toStrictEqual({
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
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: (value) => value,
      Error: (err) => {
        throw new Error(err.map((e) => e.message).join('\n'));
      },
    });

    expect(result).toStrictEqual({
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
    const result = parseAliasableShadowValue('{shadows.b-shadow}', {
      nodeId: 'abc',
      varName: 'shadows.a-shadow',
      path: ['shadows', 'a-shadow'],
      valuePath: [],
    }).match({
      Ok: (value) => value,
      Error: (err) => {
        throw new Error(err.map((e) => e.message).join('\n'));
      },
    });

    expect(result.raw).toStrictEqual('{shadows.b-shadow}');
    expect(result.toReferences).toStrictEqual([
      {
        fromTreePath: ['shadows', 'a-shadow'],
        fromValuePath: [],
        toTreePath: ['shadows', 'b-shadow'],
      },
    ]);
  });
  it('should parse an object value with nested aliases', () => {
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: (value) => value,
      Error: (err) => {
        throw new Error(err.map((e) => e.message).join('\n'));
      },
    });

    expect(result.raw).toStrictEqual({
      color: '{color.primary}',
      offsetX: '{space.regular}',
      offsetY: '{space.regular}',
      blur: '{space.regular}',
      spread: '{space.regular}',
    });
    expect(result.toReferences).toStrictEqual([
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
    ]);
  });
  it('should parse an array value with nested aliases', () => {
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: (value) => value,
      Error: (err) => {
        throw new Error(err.map((e) => e.message).join('\n'));
      },
    });

    expect(result.raw).toStrictEqual([
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
    ]);
    expect(result.toReferences).toStrictEqual([
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
    ]);
  });
  it('should fail whenever the color property is missing on object', () => {
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: () => {
        throw new Error('Expected an error.');
      },
      Error: (err) => err,
    });

    expect(result).toHaveLength(1);
    expect(result[0].message).toBe(
      'shadows.a-shadow must have a "color" property.',
    );
  });
  it('should fail whenever the color property is missing on array', () => {
    const result = parseAliasableShadowValue(
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
    ).match({
      Ok: () => {
        throw new Error('Expected an error.');
      },
      Error: (err) => err,
    });

    expect(result).toHaveLength(1);
    expect(result[0].message).toBe(
      'shadows.a-shadow[0] must have a "color" property.',
    );
  });
});
