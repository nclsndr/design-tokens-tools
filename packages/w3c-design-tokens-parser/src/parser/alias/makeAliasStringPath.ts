import { type Json, ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

export function makeAliasStringPath(path: Json.ValuePath) {
  return `{${path.join(ALIAS_PATH_SEPARATOR)}}`;
}
