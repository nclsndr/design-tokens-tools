import {
  TokensLibrary,
  SourceTokenTree,
  SourceCollection,
} from './client/TokensLibrary.js';

/**
 * Create a new TokensLibrary instance.
 * @param tokenTrees
 * @param collections
 */
export function createTokensLibrary({
  tokenTrees,
  collections,
}: {
  tokenTrees: Array<SourceTokenTree>;
  collections?: Array<SourceCollection>;
}) {
  return new TokensLibrary(tokenTrees ?? [], collections ?? []);
}
