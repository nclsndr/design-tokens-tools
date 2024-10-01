import { type Json } from 'design-tokens-format-module';

export function getJSONValue(
  object: Json.Array | Json.Object,
  path: Json.ValuePath,
): Json.Value | undefined {
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
