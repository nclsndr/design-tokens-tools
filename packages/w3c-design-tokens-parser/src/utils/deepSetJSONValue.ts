import { type JSON } from 'design-tokens-format-module';

// Forked from dset > https://github.com/lukeed/dset/blame/master/src/index.js

export function deepSetJSONValue(
  host: JSON.Object | JSON.Array,
  path: JSON.ValuePath,
  value: unknown,
) {
  const pathLength = path.length;
  if (pathLength === 0)
    throw new Error('Cannot set value to root of object or array');

  let index = 0;
  let currentKey: string | number;
  let nextValue;

  while (index < pathLength) {
    currentKey = path[index++];

    // Prototype pollution mitigation
    if (
      currentKey === '__proto__' ||
      currentKey === 'constructor' ||
      currentKey === 'prototype'
    )
      break;

    if (index === pathLength) {
      if (Array.isArray(host) && typeof currentKey === 'string') {
        throw new Error('Cannot set string key on array');
      } else if (!Array.isArray(host) && typeof currentKey === 'number') {
        throw new Error('Cannot set number key on object');
      }
      nextValue = value;
    } else if (typeof (host as any)[currentKey] === 'object') {
      nextValue = (host as any)[currentKey];
    } else if (typeof path[index] === 'number') {
      nextValue = [];
    } else {
      nextValue = {};
    }

    host = (host as any)[currentKey] = nextValue;
  }
}
