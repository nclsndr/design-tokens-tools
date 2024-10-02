import { JSONTokenTree } from 'design-tokens-format-module';

import { TokenState } from '../state/TokenState.js';
import { deepSetJSONValue } from './deepSetJSONValue.js';

export function tokenStatesToJSON(tokenStates: TokenState[]): JSONTokenTree {
  const acc: JSONTokenTree = {};

  for (const tokenState of tokenStates) {
    deepSetJSONValue(
      acc,
      tokenState.path,
      tokenState.getJSONToken({
        withExplicitType: true,
      }),
    );
  }

  return acc;
}
