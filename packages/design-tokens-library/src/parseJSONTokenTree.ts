import { buildTreeState } from './state/buildTreeState.js';
import { TokenTree } from './client/TokenTree.js';

/**
 * Parse a JSON token tree into a TokenTree instance.
 * @param jsonTokenTree - The JSON token tree to parse, must be string or object.
 * @param options
 * @param options.name - The name of the token tree.
 * @param options.throwOnError - Throw an error if the token tree is invalid.
 */
export function parseJSONTokenTree(
  jsonTokenTree: unknown,
  options?: { name?: string; throwOnError?: boolean },
) {
  const treeState = buildTreeState(jsonTokenTree, options);
  return new TokenTree(treeState);
}
