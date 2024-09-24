import { type JSON } from 'design-tokens-format-module';

import { AnalyzedToken } from '../../parser/token/AnalyzedToken.js';
import { findAnalyzedTokenByPath } from '../../parser/token/findAnalyzedTokenByPath.js';
import { ReferenceResolutionTrace } from './ReferenceResolutionTrace.js';
import { JSONPath } from '../../utils/JSONPath.js';
import { Option } from 'effect';

export function recursivelyResolveAnalyzedToken(
  analyzedTokens: Array<AnalyzedToken>,
  analyzedToken: AnalyzedToken,
  fromTreePath: JSON.ValuePath = [],
  fromValuePath: JSON.ValuePath = [],
): Array<ReferenceResolutionTrace> {
  const acc: Array<ReferenceResolutionTrace> =
    fromTreePath.length > 0 // do not include the root token in the resolution steps
      ? [
          {
            status: 'linked',
            fromTreePath: JSONPath.fromJSONValuePath(fromTreePath),
            fromValuePath: JSONPath.fromJSONValuePath(fromValuePath),
            toTreePath: JSONPath.fromJSONValuePath(analyzedToken.path),
            targetType: analyzedToken.type,
          },
        ]
      : [];

  if (analyzedToken.value.toReferences.length === 0) {
    return acc;
  }

  return acc.concat(
    analyzedToken.value.toReferences.flatMap((ref) => {
      return findAnalyzedTokenByPath(analyzedTokens, ref.toTreePath).pipe(
        Option.match({
          onSome: (at) => {
            return recursivelyResolveAnalyzedToken(
              analyzedTokens,
              at,
              ref.fromTreePath,
              ref.fromValuePath,
            );
          },
          onNone: () => [
            {
              status: 'unlinked',
              fromTreePath: JSONPath.fromJSONValuePath(ref.fromTreePath),
              fromValuePath: JSONPath.fromJSONValuePath(ref.fromValuePath),
              toTreePath: JSONPath.fromJSONValuePath(ref.toTreePath),
            },
          ],
        }),
      );
    }),
  );
}
