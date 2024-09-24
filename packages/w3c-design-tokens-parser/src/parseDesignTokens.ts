import { buildTreeState } from './state/buildTreeState.js';
import { TokenTree } from './client/TokenTree.js';
import { Effect } from 'effect';

export function parseDesignTokens(value: unknown) {
  const treeState = Effect.runSync(buildTreeState(value));
  return new TokenTree(treeState);
}
