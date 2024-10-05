import { Option } from 'effect';
import { type Json, TokenTypeName } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

import { AnalyzedToken } from './AnalyzedToken.js';
import { findAnalyzedTokenByPath } from './findAnalyzedTokenByPath.js';

export type LinkedReferenceResolutionTrace = {
  status: 'linked';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
  targetType: TokenTypeName;
};
export type UnlinkedReferenceResolutionTrace = {
  status: 'unlinked';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
};
export type ReferenceResolutionTrace =
  | LinkedReferenceResolutionTrace
  | UnlinkedReferenceResolutionTrace;

export function recursivelyResolveAnalyzedToken(
  analyzedTokens: Array<AnalyzedToken>,
  analyzedToken: AnalyzedToken,
  fromTreePath: Json.ValuePath = [],
  fromValuePath: Json.ValuePath = [],
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
