import { describe, it, expect } from 'vitest';
import { JSONPath } from '../../src/json/JSONPath';

describe.concurrent('JSONPath', () => {
  describe.concurrent('static fromJSONValuePath', () => {
    it('creates a JSONPath instance from a non-empty path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.array).toEqual(path);
      expect(jsonPath.string).toBe('a.b.c');
      expect(jsonPath.isRoot).toBe(false);
    });
    it('creates a JSONPath instance from an empty path', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.array).toEqual(path);
      expect(jsonPath.string).toBe('');
      expect(jsonPath.isRoot).toBe(true);
    });
  });
  describe.concurrent('get array', () => {
    it('returns the array representation of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.array).toEqual(path);
    });
  });
  describe.concurrent('get string', () => {
    it('returns the string representation of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.string).toBe('a.b.c');
    });
  });
  describe.concurrent('get isRoot', () => {
    it('returns true if the path is root', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.isRoot).toBe(true);
    });
    it('returns false if the path is not root', () => {
      const path = ['a'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.isRoot).toBe(false);
    });
  });
  describe.concurrent('get parent', () => {
    it('returns the parent path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.parent.array).toEqual(['a', 'b']);
    });
    it('returns an empty path if the current path is root', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.parent.array).toEqual([]);
    });
  });
  describe.concurrent('get last', () => {
    it('returns the last element of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.last).toBe('c');
    });
    it('returns undefined if the path is empty', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.last).toBeUndefined();
    });
  });
  describe.concurrent('get first', () => {
    it('returns the first element of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.first).toBe('a');
    });
    it('returns undefined if the path is empty', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.first).toBeUndefined();
    });
  });
  describe.concurrent('get head', () => {
    it('returns the head of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.head.array).toEqual(['a', 'b']);
    });
    it('returns an empty path if the current path has one element', () => {
      const path = ['a'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.head.array).toEqual([]);
    });
  });
  describe.concurrent('get tail', () => {
    it('returns the tail of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.tail.array).toEqual(['b', 'c']);
    });
    it('returns an empty path if the current path has one element', () => {
      const path = ['a'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.tail.array).toEqual([]);
    });
  });
  describe.concurrent('get length', () => {
    it('returns the length of the path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.length).toBe(3);
    });
    it('returns zero if the path is empty', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.length).toBe(0);
    });
  });
  describe.concurrent('join', () => {
    it('joins the path elements with the given separator', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.join('.')).toBe('a.b.c');
    });
    it('returns an empty string if the path is empty', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.join('.')).toBe('');
    });
  });
  describe.concurrent('equals', () => {
    it('returns true if the paths are equal', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.equals(['a', 'b', 'c'])).toBe(true);
    });
    it('returns false if the paths are not equal', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.equals(['a', 'b'])).toBe(false);
    });
  });
  describe.concurrent('equalsStringPath', () => {
    it('returns true if the string paths are equal', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.equalsStringPath('a.b.c')).toBe(true);
    });
    it('returns false if the string paths are not equal', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.equalsStringPath('a.b')).toBe(false);
    });
  });
  describe.concurrent('equalsJSONPath', () => {
    it('returns true if the JSONPaths are equal', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath1 = JSONPath.fromJSONValuePath(path);
      const jsonPath2 = JSONPath.fromJSONValuePath(path);
      expect(jsonPath1.equalsJSONPath(jsonPath2)).toBe(true);
    });
    it('returns false if the JSONPaths are not equal', () => {
      const path1 = ['a', 'b', 'c'];
      const path2 = ['a', 'b'];
      const jsonPath1 = JSONPath.fromJSONValuePath(path1);
      const jsonPath2 = JSONPath.fromJSONValuePath(path2);
      expect(jsonPath1.equalsJSONPath(jsonPath2)).toBe(false);
    });
  });
  describe.concurrent('append', () => {
    it('appends values to the path', () => {
      const path = ['a', 'b'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      const newPath = jsonPath.append('c', 'd');
      expect(newPath.array).toEqual(['a', 'b', 'c', 'd']);
    });
  });
  describe.concurrent('concat', () => {
    it('concatenates multiple paths', () => {
      const path1 = ['a'];
      const path2 = ['b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path1);
      const newPath = jsonPath.concat(path2);
      expect(newPath.array).toEqual(['a', 'b', 'c']);
    });
  });
  describe.concurrent('toDesignTokenAliasPath', () => {
    it('returns the design token alias path', () => {
      const path = ['a', 'b', 'c'];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.toDesignTokenAliasPath()).toBe('{a.b.c}');
    });
    it('returns an empty design token alias path if the path is empty', () => {
      const path: string[] = [];
      const jsonPath = JSONPath.fromJSONValuePath(path);
      expect(jsonPath.toDesignTokenAliasPath()).toBe('{}');
    });
  });
});
