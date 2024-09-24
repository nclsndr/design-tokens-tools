import { describe, it, expect } from 'vitest';

import { parseRawToken } from '../../src/parser/token/parseRawToken';
import { Cause, Effect, Exit } from 'effect';

describe.concurrent('parseRawToken', () => {
  it('should parse a number token', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 42,
    };

    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => JSON.parse(JSON.stringify(r)),
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      id: 'abc',
      path: ['aToken'],
      type: 'number',
      value: { raw: 42, toReferences: [] },
    });
  });
  it('should parse an opaque color token', () => {
    const rawJsonToken = {
      $type: 'color',
      $value: '#ff0000',
    };

    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => JSON.parse(JSON.stringify(r)),
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      id: 'abc',
      path: ['aToken'],
      type: 'color',
      value: { raw: '#ff0000', toReferences: [] },
    });
  });
  it('should parse a transparent color token', () => {
    const rawJsonToken = {
      $type: 'color',
      $value: '#ff0000BB',
    };
    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => JSON.parse(JSON.stringify(r)),
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      id: 'abc',
      path: ['aToken'],
      type: 'color',
      value: { raw: '#ff0000BB', toReferences: [] },
    });
  });
  it('should parse a dimension token', () => {
    const rawJsonToken = {
      $type: 'dimension',
      $value: '16px',
    };
    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => JSON.parse(JSON.stringify(r)),
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      id: 'abc',
      path: ['aToken'],
      type: 'dimension',
      value: { raw: '16px', toReferences: [] },
    });
  });
  it('should parse the description and extensions of a token', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 42,
      $description: 'A number token',
      $extensions: { 'com.nclsndr.usage': 'const' },
    };

    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => JSON.parse(JSON.stringify(r)),
        onFailure: (err) => err,
      }),
    ).toStrictEqual({
      id: 'abc',
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

    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
    ).toStrictEqual([
      {
        isCritical: false,
        message: 'aToken.$description must be a string. Got "boolean".',
        nodeId: 'abc',
        nodeKey: '$description',
        treePath: ['aToken'],
        type: 'Type',
        valuePath: [],
      },
      {
        isCritical: false,
        message: 'aToken.$extensions must be an object. Got "boolean".',
        nodeId: 'abc',
        nodeKey: '$extensions',
        treePath: ['aToken'],
        type: 'Type',
        valuePath: [],
      },
    ]);
  });
  it('should fail to parse an invalid token value', () => {
    const rawJsonToken = {
      $type: 'number',
      // invalid values
      $value: 'not a number',
      $description: true,
      $extensions: 'invalid extensions',
    };
    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aToken'],
        nodeKey: '$value',
        valuePath: [],
        message: 'aToken.$value must be a number. Got "string".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aToken'],
        nodeKey: '$description',
        valuePath: [],
        message: 'aToken.$description must be a string. Got "boolean".',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aToken'],
        nodeKey: '$extensions',
        valuePath: [],
        message: 'aToken.$extensions must be an object. Got "string".',
      },
    ]);
  });
  it('should fail when type is invalid', () => {
    const rawJsonToken = {
      $type: 'unknown',
      $value: 42,
    };
    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: '',
        treePath: ['aToken'],
        nodeKey: '$type',
        valuePath: [],
        message:
          'aToken.$type must be a valid type among: "color", "dimension", "fontFamily", "fontWeight", "duration", "cubicBezier", "number", "strokeStyle", "border", "transition", "shadow", "gradient", "typography". Got "unknown".',
      },
    ]);
  });
  it('should fail when the raw value is invalid', () => {
    const rawJsonToken = {
      $type: 'number',
      $value: 'not a number',
    };

    const program = parseRawToken(rawJsonToken, {
      nodeId: 'abc',
      varName: 'aToken',
      path: ['aToken'],
      valuePath: [],
      jsonTokenTree: {
        aToken: rawJsonToken,
      },
    });

    expect(
      Exit.match(Effect.runSyncExit(program), {
        onSuccess: (r) => r,
        onFailure: (cause) =>
          Cause.match(cause, {
            onEmpty: undefined,
            onFail: (errors) => JSON.parse(JSON.stringify(errors)),
            onDie: () => undefined,
            onInterrupt: () => undefined,
            onSequential: () => undefined,
            onParallel: () => undefined,
          }),
      }),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aToken'],
        nodeKey: '$value',
        valuePath: [],
        message: 'aToken.$value must be a number. Got "string".',
      },
    ]);
  });
});
