import { TokenTypeName } from 'design-tokens-format-module';

import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { TokenState } from '../TokenState.js';
import { traverseJSONValue } from '../../utils/traverseJSONValue.js';
import { RawValuePart } from '../RawValuePart.js';

export function registerTokenRawValue<T extends TokenTypeName>(
  analyzedValue: AnalyzedValue,
  tokenState: TokenState<T>,
) {
  if (
    analyzedValue.toReferences.length === 1 &&
    analyzedValue.toReferences[0].fromValuePath.length === 0
  ) {
    return;
  }
  const stringValuePaths = analyzedValue.toReferences.map((ref) =>
    ref.fromValuePath.toString(),
  );
  traverseJSONValue(analyzedValue.raw as any, (value, rawPath) => {
    // Part of a reference, managed externally
    if (stringValuePaths.includes(rawPath.toString())) {
      return false;
    }
    if (
      value !== undefined &&
      (!(typeof value === 'object') || value === null)
    ) {
      tokenState.rawValueParts.add(new RawValuePart(rawPath, value));
      return false;
    }
    return true;
  });
}
