import { Option } from 'effect';
import { ALIAS_PATH_SEPARATOR, type Json } from 'design-tokens-format-module';

export function captureAliasPath(
  value: unknown,
): Option.Option<Json.ValuePath> {
  if (typeof value !== 'string') {
    return Option.none();
  }
  if (!value.startsWith('{') || !value.endsWith('}')) {
    return Option.none();
  }

  let cleanPath = value;
  if (value.startsWith('{')) {
    cleanPath = value.slice(1);
  }
  if (value.endsWith('}')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  return Option.some(cleanPath.split(ALIAS_PATH_SEPARATOR));
}
