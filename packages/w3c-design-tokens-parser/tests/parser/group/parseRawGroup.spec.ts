import { describe, it, expect } from 'vitest';
import { Either, Option } from 'effect';

import { parseRawGroup } from '../../../src/parser/group/parseRawGroup';

describe('parseRawGroup', () => {
  it('should parse a group definition with description and extensions values', () => {
    const tree = {
      $description: 'A group of colors',
      $extensions: {
        'com.nclsndr.usage': 'background',
      },
      blue: {
        $value: '#0000ff',
        $type: 'color',
      },
    };

    const result = parseRawGroup(tree, {
      varName: 'aGroup',
      nodeId: 'abc',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      id: expect.any(String),
      path: expect.any(Object),
      tokenType: undefined,
      childrenCount: 1,
      description: tree.$description,
      extensions: tree.$extensions,
    });
  });
  it('should parse a group with a $type property', () => {
    const tree = {
      $type: 'dimension',
    };

    const result = parseRawGroup(tree, {
      varName: 'aGroup',
      nodeId: 'abc',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(Either.getOrThrow(result)).toStrictEqual({
      id: expect.any(String),
      path: expect.any(Object),
      tokenType: 'dimension',
      childrenCount: 0,
      description: undefined,
      extensions: undefined,
    });
  });
  it('should fail when type is invalid', () => {
    const tree = {
      $type: 42,
    };

    const result = parseRawGroup(tree, {
      varName: 'aGroup',
      nodeId: 'abc',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aGroup'],
        nodeKey: '$type',
        valuePath: [],
        message:
          'aGroup.$type must be a valid type among: "color", "dimension", "fontFamily", "fontWeight", "duration", "cubicBezier", "number", "strokeStyle", "border", "transition", "shadow", "gradient", "typography". Got "42".',
      },
    ]);
  });
  it('should fail when description is not a string', () => {
    const tree = {
      $type: 'dimension',
      $description: 42,
      $extensions: {
        'com.nclsndr.usage': 'background',
      },
    };

    const result = parseRawGroup(tree, {
      varName: 'aGroup',
      nodeId: 'abc',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(
      JSON.parse(JSON.stringify(Option.getOrThrow(Either.getLeft(result)))),
    ).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        nodeId: 'abc',
        treePath: ['aGroup'],
        nodeKey: '$description',
        valuePath: [],
        message: 'aGroup.$description must be a string. Got "number".',
      },
    ]);
  });
});
