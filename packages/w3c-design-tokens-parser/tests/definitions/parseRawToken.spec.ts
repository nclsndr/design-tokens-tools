import { describe, it, expect } from 'vitest';

import { parseRawToken } from '../../src/parser/token/parseRawToken';

describe.concurrent('parseRawToken', () => {
  it('should parse a number token', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 42,
    };

    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (r) => r.toJSON(),
        Error: (_) => undefined,
      }),
    ).toStrictEqual({
      path: ['aToken'],
      type: 'number',
      value: { raw: 42, toReferences: [] },
      description: undefined,
      extensions: undefined,
    });
  });
  it('should parse an opaque color token', () => {
    const rawJsonToken = {
      $type: 'color',
      $value: '#ff0000',
    };

    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (r) => r.toJSON(),
        Error: (_) => undefined,
      }),
    ).toStrictEqual({
      path: ['aToken'],
      type: 'color',
      value: { raw: '#ff0000', toReferences: [] },
      description: undefined,
      extensions: undefined,
    });
  });
  it('should parse a transparent color token', () => {
    const rawJsonToken = {
      $type: 'color',
      $value: '#ff0000BB',
    };
    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (r) => r.toJSON(),
        Error: (_) => undefined,
      }),
    ).toStrictEqual({
      path: ['aToken'],
      type: 'color',
      value: { raw: '#ff0000BB', toReferences: [] },
      description: undefined,
      extensions: undefined,
    });
  });
  it('should parse a dimension token', () => {
    const rawJsonToken = {
      $type: 'dimension',
      $value: '16px',
    };
    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (r) => r.toJSON(),
        Error: (_) => undefined,
      }),
    ).toStrictEqual({
      path: ['aToken'],
      type: 'dimension',
      value: { raw: '16px', toReferences: [] },
      description: undefined,
      extensions: undefined,
    });
  });
  it('should parse the description and extensions of a token', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 42,
      $description: 'A number token',
      $extensions: { 'com.nclsndr.usage': 'const' },
    };

    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (r) => r.toJSON(),
        Error: (_) => undefined,
      }),
    ).toStrictEqual({
      path: ['aToken'],
      type: 'number',
      value: { raw: 42, toReferences: [] },
      description: 'A number token',
      extensions: { 'com.nclsndr.usage': 'const' },
    });
  });
  it('should fail to parse both invalid description and extensions of a token', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 42,
      $description: true,
      $extensions: false,
    };

    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      result.match({
        Ok: (_) => undefined,
        Error: (err) => JSON.stringify(err),
      }),
    ).toStrictEqual(
      '[{"type":"Type","isCritical":false,"treePath":["aToken"],"nodeKey":"$description","valuePath":[],"message":"aToken.$description must be a string. Got \\"boolean\\"."},{"type":"Type","isCritical":false,"treePath":["aToken"],"nodeKey":"$extensions","valuePath":[],"message":"aToken.$extensions must be an object. Got \\"boolean\\"."}]',
    );
  });
  it('should fail to parse an invalid token value', () => {
    const rawJsonToken = {
      $type: 'number',
      // invalid values
      $value: 'not a number',
      $description: true,
      $extensions: 'invalid extensions',
    };
    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(3);
  });
  it('should fail when type is invalid', () => {
    const rawJsonToken = {
      $type: 'unknown',
      $value: 42,
    };
    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toContain(
      'aToken.$type must be a valid type among:',
    );
  });
  it('should fail when the raw value is invalid', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 'not a number',
    };

    const result = parseRawToken(rawJsonToken, {
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'aToken.$value must be a number. Got "string".',
    );
  });
});
