import { Option } from 'effect';
import { type JSON, ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import { AnalyzedToken } from './AnalyzedToken.js';

export function findAnalyzedTokenByPath(
  analyzedTokens: Array<AnalyzedToken>,
  refPath: string | JSON.ValuePath,
): Option.Option<AnalyzedToken> {
  const stringRefPath =
    typeof refPath === 'string' ? refPath : refPath.join(ALIAS_PATH_SEPARATOR);
  const maybe = analyzedTokens.find((token) => {
    return token.stringPath === stringRefPath;
  });
  return maybe !== undefined ? Option.some(maybe) : Option.none();
}
