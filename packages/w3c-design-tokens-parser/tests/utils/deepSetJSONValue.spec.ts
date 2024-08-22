import { describe, expect, it } from 'vitest';
import { JSON } from 'design-tokens-format-module';
import { deepSetJSONValue } from '../../src/utils/deepSetJSONValue';

describe.concurrent('deepSetJSONValue', () => {
  describe.concurrent('Input validation', () => {
    it('should fail if the path is empty', () => {
      expect(() => deepSetJSONValue({}, [], 'bar')).toThrow(
        'Cannot set value to root of object or array',
      );
    });

    it('should fail to insert a key using a number on an initial object', () => {
      const obj = {};
      expect(() => deepSetJSONValue(obj, [1], 'bar')).toThrow(
        'Cannot set number key on object',
      );
    });
    it('should fail to insert a key using a number on a nested object', () => {
      const obj = {
        one: {},
      };
      expect(() => deepSetJSONValue(obj, ['one', 1], 'bar')).toThrow(
        'Cannot set number key on object',
      );
    });

    it('should fail to insert an index using a string on an initial array', () => {
      const array: JSON.Array = [];
      expect(() => deepSetJSONValue(array, ['foo'], 'bar')).toThrow(
        'Cannot set string key on array',
      );
    });
    it('should fail to insert an index using a string on a nested array', () => {
      const array: JSON.Array = [[]];
      expect(() => deepSetJSONValue(array, [0, 'foo'], 'bar')).toThrow(
        'Cannot set string key on array',
      );
    });
  });

  describe.concurrent('Array assignment', () => {
    it('should set a value at the index 0 of an empty array', () => {
      const array: JSON.Array = [];
      deepSetJSONValue(array, [0], 'hello');
      expect(array).toEqual(['hello']);
    });
    it('should set a value at the index 1 of an empty array', () => {
      const array: JSON.Array = [];
      deepSetJSONValue(array, [1], 'hello');
      expect(array).toEqual([undefined, 'hello']);
    });
    it('should set a value at the index 1 of an array of length 1', () => {
      const array: JSON.Array = ['pre'];
      deepSetJSONValue(array, [1], 'hello');
      expect(array).toEqual(['pre', 'hello']);
    });
    it('should overwrite a value at the index 0 of an array of length 1', () => {
      const array: JSON.Array = ['pre'];
      deepSetJSONValue(array, [0], 'hello');
      expect(array).toEqual(['hello']);
    });

    it('should set a nested array with value at the index 0 of an empty array', () => {
      const array: JSON.Array = [];
      deepSetJSONValue(array, [0, 0], 'hello');
      expect(array).toEqual([['hello']]);
    });
    it('should set a nested object with value at the index 0 of an empty array', () => {
      const array: JSON.Array = [];
      deepSetJSONValue(array, [0, 'foo'], 'hello');
      expect(array).toEqual([{ foo: 'hello' }]);
    });

    it('should insert a second index value of an array of length 3', () => {
      const array: JSON.Array = ['pre', 'dope', 'post'];
      deepSetJSONValue(array, [1, 'foo'], 'bar');
      expect(array).toEqual(['pre', { foo: 'bar' }, 'post']);
    });
  });
  describe.concurrent('Object assignment', () => {
    it('should set a value at the first level of an empty object', () => {
      const obj = {};
      deepSetJSONValue(obj, ['foo'], 'bar');
      expect(obj).toEqual({ foo: 'bar' });
    });
    it('should set a value at the second level of an empty object', () => {
      const obj = {};
      deepSetJSONValue(obj, ['foo', 'bar'], 'baz');
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });
    it('should overwrite a value at the first level of an object with a value', () => {
      const obj = { a: 'pre' };
      deepSetJSONValue(obj, ['a'], 'bar');
      expect(obj).toEqual({ a: 'bar' });
    });
    it('should overwrite a value at the second level of an object with a value', () => {
      const obj = { a: { b: 'pre' } };
      deepSetJSONValue(obj, ['a', 'b'], 'bar');
      expect(obj).toEqual({ a: { b: 'bar' } });
    });
    it('should overwrite a value at the first level of an object with an array', () => {
      const obj = { a: 'pre' };
      deepSetJSONValue(obj, ['a', 0], 'bar');
      expect(obj).toEqual({ a: ['bar'] });

      deepSetJSONValue(obj, ['a'], ['bar']);
      expect(obj).toEqual({ a: ['bar'] });
    });
  });

  describe.concurrent('Prototype pollution mitigation', () => {
    it('should protect against "__proto__" assignment', () => {
      let input: any = { abc: 123 };
      let before = input.__proto__;
      deepSetJSONValue(input, ['__proto__', 'hello'], 123);

      expect(input.__proto__).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
      });

      expect(({} as any).hello).not.toEqual(123);
      expect((new Object() as any).hello).not.toEqual(123);
      expect(Object.create(null).hello).not.toEqual(123);
    });
    it('should protect against "__proto__" assignment :: nested', () => {
      let input: any = { abc: 123 };
      let before = input.__proto__;
      deepSetJSONValue(input, ['prefix', '__proto__', 'hello'], 123);

      expect(input.__proto__).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
        prefix: {},
      });

      expect(({} as any).hello).toEqual(undefined);
      expect((new Object() as any).hello).toEqual(undefined);
      expect(Object.create(null).hello).toEqual(undefined);
    });
    it('should protect against "constructor" assignment', () => {
      let input: any = { abc: 123 };
      let before = input.constructor;
      deepSetJSONValue(input, ['constructor', 'hello'], 123);

      expect(input.constructor).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
      });

      expect(({} as any).hello).not.toEqual(123);
      expect((new Object() as any).hello).not.toEqual(123);
      expect(Object.create(null).hello).not.toEqual(123);
    });
    it('should protect against "constructor" assignment :: nested', () => {
      let input: any = { abc: 123 };
      let before = input.constructor;
      deepSetJSONValue(input, ['prefix', 'constructor', 'hello'], 123);

      expect(input.constructor).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
        prefix: {},
      });

      expect(({} as any).hello).toEqual(undefined);
      expect((new Object() as any).hello).toEqual(undefined);
      expect(Object.create(null).hello).toEqual(undefined);
    });
    it('should protect against "prototype" assignment', () => {
      let input: any = { abc: 123 };
      let before = input.prototype;
      deepSetJSONValue(input, ['prototype', 'hello'], 123);

      expect(input.prototype).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
      });

      expect(({} as any).hello).not.toEqual(123);
      expect((new Object() as any).hello).not.toEqual(123);
      expect(Object.create(null).hello).not.toEqual(123);
    });
    it('should protect against "prototype" assignment :: nested', () => {
      let input: any = { abc: 123 };
      let before = input.prototype;
      deepSetJSONValue(input, ['prefix', 'prototype', 'hello'], 123);

      expect(input.prototype).toEqual(before);
      expect(input).toStrictEqual({
        abc: 123,
        prefix: {},
      });

      expect(({} as any).hello).toEqual(undefined);
      expect((new Object() as any).hello).toEqual(undefined);
      expect(Object.create(null).hello).toEqual(undefined);
    });
  });
  describe.concurrent('Preservation and overwrites', () => {
    it('should preserve existing sibling object structure', () => {
      const obj = { a: { b: { c: 123 } } };
      deepSetJSONValue(obj, ['a', 'b', 'x', 'y'], 321);
      expect(obj).toEqual({
        a: {
          b: {
            c: 123,
            x: {
              y: 321,
            },
          },
        },
      });
    });
    it('should overwrite existing scalar values by an object', () => {
      const obj = { a: { b: { c: 123 } } };
      deepSetJSONValue(obj, ['a', 'b'], { x: { y: 321 } });
      expect(obj).toEqual({
        a: {
          b: {
            x: {
              y: 321,
            },
          },
        },
      });
    });
    it('should preserve existing object tree w/ array value', () => {
      let input = {
        a: {
          b: {
            c: 123,
            d: {
              e: 5,
            },
          },
        },
      };

      deepSetJSONValue(input, ['a', 'b', 'd', 'z'], [1, 2, 3, 4]);

      expect(input.a.b.d).toStrictEqual({
        e: 5,
        z: [1, 2, 3, 4],
      });
    });
  });
});
