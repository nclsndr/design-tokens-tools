import { JSONValuePath } from '../../definitions/JSONDefinitions.js';
import { AnalyzedToken } from '../internals/AnalyzedToken.js';
import { findAnalyzedToken } from '../internals/findAnalyzedToken.js';
import { ReferenceResolutionTrace } from '../internals/ReferenceResolutionTrace.js';

export function recursivelyResolveAnalyzedToken(
  analyzedTokens: Array<AnalyzedToken>,
  analyzedToken: AnalyzedToken,
  fromTreePath: JSONValuePath = [],
  fromValuePath: JSONValuePath = [],
): Array<ReferenceResolutionTrace> {
  const acc: Array<ReferenceResolutionTrace> =
    fromTreePath.length > 0 // do not include the root token in the resolution steps
      ? [
          {
            status: 'resolved',
            fromTreePath: fromTreePath,
            fromValuePath: fromValuePath,
            toTreePath: analyzedToken.path,
            targetType: analyzedToken.type,
          },
        ]
      : [];

  if (analyzedToken.value.toReferences.length === 0) {
    return acc;
  }

  return acc.concat(
    analyzedToken.value.toReferences.flatMap((ref) => {
      return findAnalyzedToken(analyzedTokens, ref.toTreePath).match({
        Some: (at) => {
          return recursivelyResolveAnalyzedToken(
            analyzedTokens,
            at,
            ref.fromTreePath,
            ref.fromValuePath,
          );
        },
        None: () => [
          {
            status: 'unresolvable',
            fromTreePath: ref.fromTreePath,
            fromValuePath: ref.fromValuePath,
            toTreePath: ref.toTreePath,
          },
        ],
      });
    }),
  );
}
