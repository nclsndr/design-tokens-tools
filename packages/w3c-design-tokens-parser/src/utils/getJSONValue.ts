import { type JSON } from 'design-tokens-format-module';

export function getJSONValue(
  object: JSON.Array | JSON.Object,
  path: JSON.ValuePath,
): JSON.Value | undefined {
  for (let p = 0; p < path.length; p++) {
    try {
      // @ts-expect-error
      object = object[path[p]];
    } catch (error) {
      return undefined;
    }
  }
  return object;
}
