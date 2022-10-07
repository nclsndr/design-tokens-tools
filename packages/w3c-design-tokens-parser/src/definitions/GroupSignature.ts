import { TokenTypeName } from './tokenTypes.js';
import { JSONObject } from './JSONDefinitions.js';

export type GroupProperties = {
  $type?: TokenTypeName;
  $description?: string;
  $extensions?: JSONObject;
};

export function matchIsGroupSignature(
  value: unknown,
): value is GroupProperties {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
