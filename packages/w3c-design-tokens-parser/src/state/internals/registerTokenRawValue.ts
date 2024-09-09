import { TokenTypeName } from 'design-tokens-format-module';

import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
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
    // Token is top level alias
    return;
  }
  const stringValuePaths = analyzedValue.toReferences.map((ref) =>
    ref.fromValuePath.join(),
  );
  traverseJSONValue(analyzedValue.raw as any, (value, path) => {
    if (stringValuePaths.includes(path.join())) {
      // Part of a reference, managed externally
      return false;
    }
    if (
      value !== undefined &&
      (!(typeof value === 'object') || value === null)
    ) {
      // Value is scalar
      tokenState.rawValueParts.add(new RawValuePart(path, value));
      return false;
    }
    // Value is most likely object or array
    return true;
  });
}
