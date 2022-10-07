import { describe, it, expect } from 'vitest';
import { parseGroup } from '../../src/parser/group/parseGroup';

describe('parseGroup', () => {
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

    const result = parseGroup(tree, {
      varName: 'aGroup',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(result.isOk()).toBe(true);
    expect(result.isOk() && result.get()).toStrictEqual({
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

    const result = parseGroup(tree, {
      varName: 'aGroup',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(result.isOk()).toBe(true);
    expect(result.isOk() && result.get()).toStrictEqual({
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

    const result = parseGroup(tree, {
      varName: 'aGroup',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toContain(
      'aGroup.$type must be a valid type among:',
    );
  });
  it('should fail when description is not a string', () => {
    const tree = {
      $type: 'dimension',
      $description: 42,
      $extensions: {
        'com.nclsndr.usage': 'background',
      },
    };

    const result = parseGroup(tree, {
      varName: 'aGroup',
      path: ['aGroup'],
      valuePath: [],
    });

    expect(result.isError()).toBe(true);
    expect(result.isError() && result.getError()).toHaveLength(1);
    expect(result.isError() && result.getError()[0].message).toBe(
      'aGroup.$description must be a string. Got "number".',
    );
  });
});
