import { buildTreeState } from './state/buildTreeState.js';
import { TokenTree } from './client/TokenTree.js';

export function parseDesignTokens(value: unknown) {
  const treeState = buildTreeState(value);
  return new TokenTree(treeState);
}
