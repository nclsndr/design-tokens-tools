import { Either, Option } from 'effect';
import {
  ALIAS_PATH_SEPARATOR,
  JSON,
  TokenTypeName,
} from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { matchTokenTypeAgainstAliasingMapping } from '../../definitions/matchTokenTypeAgainstAliasingMapping.js';
import { AnalyzedToken } from './AnalyzedToken.js';
import { findAnalyzedTokenByPath } from './findAnalyzedTokenByPath.js';

type SyntheticRef = {
  tokenId: string;
  tokenType: TokenTypeName;
  fromTreeStringPath: string;
  toTreeStringPath: string;
  fromTreePath: JSON.ValuePath;
  fromValuePath: JSON.ValuePath;
  toTreePath: JSON.ValuePath;
};

export function captureAnalyzedTokensReferenceErrors(
  analyzedTokens: Array<AnalyzedToken>,
) {
  const syntheticRefs: Array<SyntheticRef> = analyzedTokens.flatMap((t) =>
    t.value.toReferences.map((r) => ({
      tokenId: t.id,
      tokenType: t.type,
      fromTreeStringPath: r.fromTreePath.join(ALIAS_PATH_SEPARATOR),
      toTreeStringPath: r.toTreePath.join(ALIAS_PATH_SEPARATOR),
      fromValuePath: r.fromValuePath,
      fromTreePath: r.fromTreePath,
      toTreePath: r.toTreePath,
    })),
  );

  function recursivelyResolveRef(
    sRef: SyntheticRef,
    chain: Array<string> = [],
    initialRef: SyntheticRef | undefined = undefined,
  ) {
    if (!initialRef) {
      initialRef = sRef;
    }

    // Already visited this reference
    if (chain.includes(sRef.toTreeStringPath)) {
      // Circular reference starts from the initial token
      if (chain.includes(initialRef.fromTreeStringPath)) {
        return new ValidationError({
          type: 'Value',
          nodeId: initialRef.tokenId,
          treePath: initialRef.fromTreePath,
          valuePath: initialRef.fromValuePath,
          message: `Circular reference detected: ${initialRef.fromTreeStringPath} -> ${chain.join(
            ' -> ',
          )}.`,
          nodeKey: '$value',
          referenceToTreePath: initialRef.toTreePath,
        });
      }

      // Skip circular reference not starting from the initial token
      return undefined;
    }

    let targetTokenType: TokenTypeName | undefined;
    const maybeNextSRef = syntheticRefs.find(
      (r) => r.fromTreeStringPath === sRef.toTreeStringPath,
    );

    if (maybeNextSRef) {
      // The reference is linked to another reference
      targetTokenType = maybeNextSRef.tokenType;
    } else if (sRef.tokenId === initialRef.tokenId) {
      // Only check for 1st depth type compatibility

      // Check if the reference is linked to a token
      targetTokenType = findAnalyzedTokenByPath(
        analyzedTokens,
        sRef.toTreePath,
      ).pipe(
        Option.match({
          onSome: (foundAnalyzedToken) => {
            return foundAnalyzedToken.type;
          },
          onNone: () => {
            return undefined;
          },
        }),
      );
    }

    // Unlinked reference - skip the validation
    if (!targetTokenType) {
      return undefined;
    }

    // Check for token type compatibility over the alias chain
    const typeMatchingResult = Either.mapLeft(
      matchTokenTypeAgainstAliasingMapping(
        sRef.tokenType,
        targetTokenType,
        sRef.fromTreePath,
        sRef.fromValuePath,
      ),
      (err) =>
        new ValidationError({
          type: 'Type',
          nodeId: sRef.tokenId,
          treePath: sRef.fromTreePath,
          valuePath: sRef.fromValuePath,
          message: `Type mismatch: expected [ ${err.expectedType} ] - got Token(${targetTokenType}).`,
          nodeKey: '$value',
          referenceToTreePath: sRef.toTreePath,
        }),
    );

    if (Either.isLeft(typeMatchingResult)) {
      return typeMatchingResult.left;
    }

    // No more references to resolve
    if (!maybeNextSRef) {
      return undefined;
    }

    return recursivelyResolveRef(
      maybeNextSRef,
      [...chain, sRef.toTreeStringPath],
      initialRef,
    );
  }

  const [referenceErrors, tokenWithErrorIds] = syntheticRefs.reduce<
    [Array<ValidationError>, Array<string>]
  >(
    (acc, r) => {
      const matched = recursivelyResolveRef(r);
      if (matched) {
        acc[0].push(matched);
        acc[1].push(matched.nodeId);
      }
      return acc;
    },
    [[], []],
  );

  const referenceErrorsFreeAnalyzedTokens = analyzedTokens.filter((t) => {
    return !tokenWithErrorIds.includes(t.id);
  });

  return {
    referenceErrors,
    referenceErrorsFreeAnalyzedTokens,
  };
}
