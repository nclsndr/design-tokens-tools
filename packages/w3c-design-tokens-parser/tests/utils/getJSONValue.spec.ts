import { describe, it, expect } from 'vitest';
import { getJSONValue } from '../../src/utils/getJSONValue';
import { JSONValuePath } from '../../src/definitions/JSONDefinitions';

describe.concurrent('getJSONValue', () => {
  it('should return a truthy value at the object given path', () => {
    const object = {
      a: {
        b: {
          c: 42,
        },
      },
    };

    const path = ['a', 'b', 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe(42);
  });
  it('should return a false value at the object given path', () => {
    const object = {
      a: {
        b: {
          c: false,
        },
      },
    };

    const path = ['a', 'b', 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe(false);
  });
  it('should return a empty string value at the object given path', () => {
    const object = {
      a: {
        b: {
          c: '',
        },
      },
    };

    const path = ['a', 'b', 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe('');
  });
  it('should return a 0 value at the object given path', () => {
    const object = {
      a: {
        b: {
          c: 0,
        },
      },
    };

    const path = ['a', 'b', 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe(0);
  });
  it('should return a null value at the object given path', () => {
    const object = {
      a: {
        b: {
          c: null,
        },
      },
    };

    const path = ['a', 'b', 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe(null);
  });
  it('should return a truthy value at the array given path', () => {
    const object = [[[42]]];

    const path = [0, 0, 0];
    const value = getJSONValue(object, path);

    expect(value).toBe(42);
  });
  it('should return a value at the object given path with mixed types', () => {
    const object = {
      a: [{ c: 42 }, { d: 32 }],
    };

    const path = ['a', 0, 'c'];
    const value = getJSONValue(object, path);

    expect(value).toBe(42);
  });
  it('should return a value at the object given path with number keys', () => {
    const object = {
      '1': { 2: { '0.3': 42 } },
    };

    const path = [1, '2', '0.3'];
    const value = getJSONValue(object, path);

    expect(value).toBe(42);
  });
  it('should return the current object if the path is empty', () => {
    const object = {
      a: {
        b: {
          c: 42,
        },
      },
    };

    const path: JSONValuePath = [];
    const value = getJSONValue(object, path);

    expect(value).toBe(object);
  });
  it('should return undefined if the path does not exist', () => {
    const object = {
      a: {
        b: {
          c: 42,
        },
      },
    };

    const path = ['a', 'b', 'd'];
    const value = getJSONValue(object, path);

    expect(value).toBe(undefined);
  });
  it('should return undefined if input is number', () => {
    const path = ['a', 'b'];
    const value = getJSONValue(
      // @ts-expect-error
      42,
      path,
    );

    expect(value).toBe(undefined);
  });
  it('should return undefined if input is null', () => {
    const path = ['a', 'b'];
    const value = getJSONValue(
      // @ts-expect-error
      null,
      path,
    );

    expect(value).toBe(undefined);
  });
});
