import { Option } from '@swan-io/boxed';
import { ALIAS_PATH_SEPARATOR, type JSON } from 'design-tokens-format-module';

export function captureAliasPath(value: unknown): Option<JSON.ValuePath> {
  if (typeof value !== 'string') {
    return Option.None();
  }
  if (!value.startsWith('{') || !value.endsWith('}')) {
    return Option.None();
  }

  let cleanPath = value;
  if (value.startsWith('{')) {
    cleanPath = value.slice(1);
  }
  if (value.endsWith('}')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  return Option.Some(cleanPath.split(ALIAS_PATH_SEPARATOR));
}