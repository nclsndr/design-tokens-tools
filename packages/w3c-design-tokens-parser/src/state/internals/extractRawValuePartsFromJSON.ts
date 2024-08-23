import { DesignToken, matchIsAliasValue } from 'design-tokens-format-module';

import { RawValuePart } from '../RawValuePart.js';
import { traverseJSONValue } from '../../utils/traverseJSONValue.js';

export function extractRawValuePartsFromJSON(
  tokenValue: DesignToken['$value'],
) {
  const acc: Array<RawValuePart> = [];

  traverseJSONValue(tokenValue as any, (value, rawPath) => {
    // Part of a reference, managed externally
    if (matchIsAliasValue(value)) {
      return false;
    }
    if (
      value !== undefined &&
      (!(typeof value === 'object') || value === null)
    ) {
      acc.push(new RawValuePart(rawPath, value));
      return false;
    }
    return true;
  });

  return acc;
}
