import { JSONValuePath } from '../../definitions/JSONDefinitions.js';
import { ALIAS_PATH_SEPARATOR } from '../../definitions/AliasSignature.js';

export function makeAliasStringPath(path: JSONValuePath) {
  return `{${path.join(ALIAS_PATH_SEPARATOR)}}`;
}
