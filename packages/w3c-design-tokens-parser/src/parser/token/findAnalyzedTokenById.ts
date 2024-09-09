import { AnalyzedToken } from './AnalyzedToken.js';
import { Option } from '@swan-io/boxed';

export function findAnalyzedTokenById(
  analyzedTokens: Array<AnalyzedToken>,
  id: string,
): Option<AnalyzedToken> {
  const maybeEntry = analyzedTokens.find((at) => at.id === id);
  return maybeEntry ? Option.Some(maybeEntry) : Option.None();
}
