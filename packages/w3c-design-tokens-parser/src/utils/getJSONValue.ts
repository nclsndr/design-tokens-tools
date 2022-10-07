import {
  JSONArray,
  JSONObject,
  JSONValue,
  JSONValuePath,
} from '../definitions/JSONDefinitions.js';

export function getJSONValue(
  object: JSONArray | JSONObject,
  path: JSONValuePath,
): JSONValue | undefined {
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
