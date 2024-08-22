import { type JSON, ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

export function makeAliasStringPath(path: JSON.ValuePath) {
  return `{${path.join(ALIAS_PATH_SEPARATOR)}}`;
}
