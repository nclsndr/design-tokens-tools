import { type Json, TokenTypeName } from 'design-tokens-format-module';
import { matchTypeAgainstMapping } from '@nclsndr/design-tokens-utils';

import { tokenTypesAliasingMapping } from '../../definitions/tokenTypesAliasingMapping.js';

export function matchTokenTypeAgainstAliasingMapping(
  type: TokenTypeName,
  input: unknown,
  treePath: Json.ValuePath,
  valuePath: Json.ValuePath,
) {
  return matchTypeAgainstMapping(
    input,
    tokenTypesAliasingMapping[type],
    treePath,
    valuePath,
  );
}
