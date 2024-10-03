import { JSONTokenTree } from 'design-tokens-format-module';
import { deepSetJSONValue } from '@nclsndr/design-tokens-utils';

import { TokenState } from '../state/token/TokenState.js';

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
