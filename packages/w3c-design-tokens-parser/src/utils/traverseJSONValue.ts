import { type JSON } from 'design-tokens-format-module';

export function traverseJSONValue(
  JSONValue: JSON.Value,
  callback: (data: JSON.Value, path: JSON.ValuePath) => boolean | void,
  path: JSON.ValuePath = [],
) {
  if (JSONValue === undefined) throw new Error('JSONValue is undefined');
  const shouldDive = callback(JSONValue, path) ?? true;
  if (!shouldDive) return;
  if (JSONValue !== null && typeof JSONValue === 'object') {
    if (Array.isArray(JSONValue)) {
      JSONValue.forEach((item, i) => {
        traverseJSONValue(item, callback, [...path, i]);
      });
    } else {
      Object.keys(JSONValue).forEach((key) => {
        traverseJSONValue(JSONValue[key], callback, [...path, key]);
      });
    }
  }
}
