import { TokenTypeName } from './tokenTypes.js';
import { JSONObject, JSONValue } from './JSONDefinitions.js';

export type TokenSignature<
  Type extends TokenTypeName = TokenTypeName,
  Value extends JSONValue = JSONValue,
> = {
  $value: Value;
  $type?: Type;
  $description?: string;
  $extensions?: JSONObject;
};

export type JsonRawTokenSignature = {
  $value: JSONValue;
  $type?: string;
  $description?: string;
  $extensions?: JSONObject;
};

export function matchIsTokenSignature(
  value: unknown,
): value is JsonRawTokenSignature {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    '$value' in value
  );
}
