import { Option } from '@swan-io/boxed';

import type { JSONValuePath } from '../../definitions/JSONDefinitions.js';
import { ALIAS_PATH_SEPARATOR } from '../../definitions/AliasSignature.js';

export function captureAliasPath(value: unknown): Option<JSONValuePath> {
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
