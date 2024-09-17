import { describe, it, expect } from 'vitest';

import { parseAliasableTypographyValue } from '../../../src/definitions/tokenTypes/typography';

describe.concurrent('parseAliasableTypographyValue', () => {
  it('should parse a valid typography value', () => {
    const result = parseAliasableTypographyValue(
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

    expect((result as any).value).toStrictEqual({
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
    const result = parseAliasableTypographyValue('{typography.foo}', {
      nodeId: 'abc',
      varName: 'foo',
      path: ['foo'],
      valuePath: [],
    });

    expect((result as any).value.raw).toStrictEqual('{typography.foo}');
  });
  it('should parse a typography value with nested aliases', () => {
    const result = parseAliasableTypographyValue(
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

    expect((result as any).value.raw).toStrictEqual({
      fontFamily: '{fonts.foo}',
      fontSize: '{fontSize.foo}',
      fontWeight: '{fontWeight.foo}',
      lineHeight: '{lineHeight.foo}',
      letterSpacing: '{letterSpacing.foo}',
    });
    expect((result as any).value.toReferences).toHaveLength(5);
    expect((result as any).value.toReferences).toStrictEqual([
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
    ]);
  });
});
