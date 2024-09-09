import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';
import { parseJSONTokenTree } from '../../../src/parser/parseJSONTokenTree';
import { captureAnalyzedTokensReferenceErrors } from '../../../src/parser/token/captureAnalyzedTokensReferenceErrors';

describe('captureAnalyzedTokensReferenceErrors', () => {
  it('should capture circular dependency of length 0', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message: 'Circular reference detected: color.blue -> color.blue.',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(0);
  });
  it('should capture circular dependency of length 1', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(2);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(0);
  });
  it('should capture circular dependency of length 2', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.indigo}',
        },
        indigo: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.indigo -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'indigo'],
        message:
          'Circular reference detected: color.cyan -> color.indigo -> color.blue -> color.cyan.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'indigo'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.indigo -> color.blue -> color.cyan -> color.indigo.',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(0);
  });

  it('should capture invalid type reference - explicitly defined', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          $value: '{color.blue}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(1);
    expect(referenceErrorsFreeAnalyzedTokens[0].stringPath).toBe('color.blue');
  });
  it('should capture invalid type reference in composite token - explicitly defined', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '#0000ff',
        },
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            width: '{color.blue}',
            style: 'solid',
            color: '#000000',
          },
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['border', 'base'],
        nodeKey: '$value',
        valuePath: ['width'],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(1);
    expect(referenceErrorsFreeAnalyzedTokens[0].stringPath).toBe('color.blue');
  });
  it('should capture invalid type reference - parent based', () => {
    const tokens: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#0000ff',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          $value: '{color.blue}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(1);
    expect(referenceErrorsFreeAnalyzedTokens[0].stringPath).toBe('color.blue');
  });

  it('should keep the token referencing a token pointing to an invalid type', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          // Raw value
          $value: '#0d3181',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          // Invalid type reference
          $value: '{color.blue}',
        },
        alt: {
          $type: 'dimension',
          // Valid type reference
          $value: '{space.base}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(2);
    expect(
      referenceErrorsFreeAnalyzedTokens.map((r) => r.stringPath),
    ).toStrictEqual(['color.blue', 'space.alt']);
  });
  it('should keep the token referencing a circular references loop', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          $value: '{color.blue}',
        },
        indigo: {
          $type: 'color',
          $value: '{color.blue}',
        },
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            width: '4px',
            style: 'solid',
            color: '{color.blue}',
          },
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(2);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(2);
    expect(
      referenceErrorsFreeAnalyzedTokens.map((r) => r.stringPath),
    ).toStrictEqual(['color.indigo', 'border.base']);
  });

  it('should remove the errored tokens while keeping the valid ones', () => {
    const tokens: JSONTokenTree = {
      color: {
        blue: {
          $type: 'color',
          // Circular reference
          $value: '{color.cyan}',
        },
        cyan: {
          $type: 'color',
          // Circular reference
          $value: '{color.blue}',
        },
        indigo: {
          $type: 'color',
          // Non circular reference
          $value: '{color.blue}',
        },
        deepBlue: {
          $type: 'color',
          // Raw value
          $value: '#0d3181',
        },
        green: {
          $type: 'color',
          // Unlinked reference
          $value: '{color.jade}',
        },
      },
      space: {
        base: {
          $type: 'dimension',
          // Invalid type reference
          $value: '{color.deepBlue}',
        },
        alt: {
          $type: 'dimension',
          // Valid type reference
          $value: '{space.base}',
        },
      },
    };

    const [analyzedTokens, errors] = parseJSONTokenTree(tokens).match({
      Ok: ({ tokens }) => tokens,
      Error: (error) => {
        throw error;
      },
    });
    expect(errors).toHaveLength(0);

    const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
      captureAnalyzedTokensReferenceErrors(analyzedTokens);

    expect(referenceErrors).toHaveLength(3);
    expect(JSON.parse(JSON.stringify(referenceErrors))).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'blue'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'cyan'],
        message:
          'Circular reference detected: color.blue -> color.cyan -> color.blue.',
      },
      {
        type: 'Value',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['color', 'cyan'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Circular reference detected: color.cyan -> color.blue -> color.cyan.',
      },
      {
        type: 'Type',
        isCritical: false,
        nodeId: expect.any(String),
        treePath: ['space', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'deepBlue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
    ]);

    expect(referenceErrorsFreeAnalyzedTokens).toHaveLength(4);
    expect(
      referenceErrorsFreeAnalyzedTokens.map((r) => r.stringPath),
    ).toStrictEqual([
      'color.indigo',
      'color.deepBlue',
      'color.green',
      'space.alt',
    ]);
  });
});
