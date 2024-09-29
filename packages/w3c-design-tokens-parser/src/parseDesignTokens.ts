import { buildTreeState } from './state/buildTreeState.js';
import { TokenTree } from './client/TokenTree.js';

/**
 * Parse a JSON token tree into a TokenTree instance.
 * @param jsonTokenTree
 */
export function parseDesignTokens(jsonTokenTree: unknown) {
  const treeState = buildTreeState(jsonTokenTree);
  return new TokenTree(treeState);
}
