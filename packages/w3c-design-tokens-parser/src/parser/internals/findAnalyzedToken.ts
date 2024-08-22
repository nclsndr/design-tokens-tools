import { Option } from '@swan-io/boxed';
import { type JSON } from 'design-tokens-format-module';

import { AnalyzedToken } from './AnalyzedToken.js';
import { ANALYZER_PATH_SEPARATOR } from './AnalyzerContext.js';

export function findAnalyzedToken(
  analyzedTokens: Array<AnalyzedToken>,
  refPath: string | JSON.ValuePath,
): Option<AnalyzedToken> {
  const stringRefPath =
    typeof refPath === 'string'
      ? refPath
      : refPath.join(ANALYZER_PATH_SEPARATOR);
  const maybe = analyzedTokens.find((token) => {
    return token.stringPath === stringRefPath;
  });
  return maybe !== undefined ? Option.Some(maybe) : Option.None();
}
