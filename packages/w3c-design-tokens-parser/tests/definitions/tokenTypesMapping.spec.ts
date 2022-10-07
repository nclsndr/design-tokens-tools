import { describe, it, expect } from 'vitest';
import {
  matchTypeAgainstMapping,
  TokenTypesMapping,
} from '../../src/definitions/tokenTypesMapping';
import { JSONValuePath } from '../../src/definitions/JSONDefinitions';

describe('matchTypeAgainstMapping', () => {
  it('should match a shallow token type', () => {
    const mapping = { _tokenType: 'string' } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 'string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match any primitive type', () => {
    const mapping = { _primitive: 'number' } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 42;

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match a constant value type', () => {
    const mapping = { _constant: 42 } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 42;

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match a union of token types', () => {
    const mapping = {
      _unionOf: [{ _tokenType: 'string' }, { _tokenType: 'number' }],
    } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match a map type', () => {
    const mapping = {
      _mapOf: {
        title: { _tokenType: 'string' },
        author: { _tokenType: 'string' },
      },
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = ['author'];

    const input = 'string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match an array type', () => {
    const mapping = {
      _arrayOf: { _tokenType: 'string' },
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [0];

    const input = 'string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });
  it('should match a tuple type', () => {
    const mapping = {
      _tuple: [{ _tokenType: 'string' }, { _tokenType: 'number' }],
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [1];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (value) => value,
        Error: (_) => undefined,
      }),
    ).toBe(true);
  });

  it('should fail to match a shallow token type', () => {
    const mapping = { _tokenType: 'string' } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'Token(string)',
    });
  });
  it('should fail to match any primitive type', () => {
    const mapping = { _primitive: 'number' } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 'a string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: "typeof === 'number'",
    });
  });
  it('should fail to match a constant value type', () => {
    const mapping = { _constant: 42 } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 100;

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'const(42: number)',
    });
  });
  it('should fail to match a union of token types', () => {
    const mapping = {
      _unionOf: [{ _tokenType: 'string' }, { _primitive: 'number' }],
    } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = [];

    const input = 'border';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: "Token(string) | typeof === 'number'",
    });
  });
  it('should fail to match a deep union of token types', () => {
    const mapping = {
      _unionOf: [
        { _tokenType: 'string' },
        {
          _mapOf: {
            value: {
              _unionOf: [
                { _primitive: 'number' },
                { _constant: 'C' },
                {
                  _mapOf: {
                    sub: { _constant: 'A' },
                  },
                },
              ],
            },
          },
        },
      ],
    } satisfies TokenTypesMapping;
    const treePath: JSONValuePath = ['some', 'token'];
    const valuePath: JSONValuePath = ['value'];

    const input = 'boolean';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType:
        'typeof === \'number\' | const("C": string) | key: "sub" - got: undefined',
    });
  });
  it('should fail to match a key of a map type', () => {
    const mapping = {
      _mapOf: {
        title: { _tokenType: 'string' },
      },
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = ['title'];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: `Token(string)`,
    });
  });
  it('should fail to match an unknown key of map type', () => {
    const mapping = {
      _mapOf: {
        title: { _tokenType: 'string' },
        author: { _tokenType: 'string' },
      },
    };

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = ['description'];

    const input = 'string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'key: "title", "author" - got: "description"',
    });
  });
  it('should fail to match an unknown key of map type with union', () => {
    const mapping = {
      _mapOf: {
        title: {
          _unionOf: [{ _tokenType: 'string' }, { _tokenType: 'number' }],
        },
      },
    };

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = ['title'];

    const input = 'boolean';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'Token(string) | Token(number)',
    });
  });
  it('should fail to match a key of an array type', () => {
    const mapping = {
      _arrayOf: { _tokenType: 'string' },
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [0];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'Token(string)',
    });
  });
  it('should fail to match a key of a tuple type', () => {
    const mapping = {
      _tuple: [{ _tokenType: 'string' }, { _tokenType: 'number' }],
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [1];

    const input = 'string';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'Token(number)',
    });
  });
  it('should fail to match an unknown index of tuple type', () => {
    const mapping = {
      _tuple: [{ _tokenType: 'string' }, { _tokenType: 'number' }],
    } satisfies TokenTypesMapping;

    const treePath: JSONValuePath = ['a', 'token'];
    const valuePath: JSONValuePath = [2];

    const input = 'number';

    const result = matchTypeAgainstMapping(input, mapping, treePath, valuePath);

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => err,
      }),
    ).toStrictEqual({
      expectedType: 'index: 0, 1 - got: 2',
    });
  });
});
