import { Either, Option } from 'effect';
import { parseJSONTokenTree } from '../parser/parseJSONTokenTree.js';
import { findAnalyzedTokenByPath } from '../parser/token/findAnalyzedTokenByPath.js';
import { TokenState } from './TokenState.js';
import { TreeState } from './TreeState.js';
import { GroupState } from './GroupState.js';
import { Reference } from './Reference.js';
import { captureAnalyzedTokensReferenceErrors } from '../parser/token/captureAnalyzedTokensReferenceErrors.js';

export function buildTreeState(value: unknown) {
  const treeState = new TreeState();
  return Either.match(parseJSONTokenTree(value), {
    onRight: ({ analyzedTokens, analyzedGroups, tokenErrors, groupErrors }) => {
      if (tokenErrors.length > 0 || groupErrors.length > 0) {
        treeState.validationErrors.add(...tokenErrors);
      }

      const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
        captureAnalyzedTokensReferenceErrors(analyzedTokens);

      treeState.validationErrors.add(...referenceErrors);

      for (const analyzedToken of referenceErrorsFreeAnalyzedTokens) {
        const tokenState = new TokenState(
          analyzedToken.id,
          analyzedToken.path,
          analyzedToken.type,
          analyzedToken.typeResolution,
          analyzedToken.description,
          analyzedToken.extensions,
          treeState,
        );
        // Register the raw value parts
        tokenState.registerAnalyzedValueRawParts(analyzedToken.value);

        // Register token within the tree
        treeState.tokenStates.add(tokenState);

        // Built up the reference states to add in treeState
        for (const analyzedRef of analyzedToken.value.toReferences) {
          findAnalyzedTokenByPath(analyzedTokens, analyzedRef.toTreePath).pipe(
            Option.match({
              onSome: (foundAnalyzedToken) => {
                treeState.references.add(
                  new Reference(
                    analyzedToken.id,
                    analyzedRef.fromValuePath,
                    foundAnalyzedToken.id,
                    undefined,
                    foundAnalyzedToken.type,
                    treeState,
                  ),
                );
              },
              onNone: () => {
                treeState.references.add(
                  new Reference(
                    analyzedToken.id,
                    analyzedRef.fromValuePath,
                    undefined,
                    analyzedRef.toTreePath,
                    undefined,
                    treeState,
                  ),
                );
              },
            }),
          );
        }
      }

      for (const analyzedGroup of analyzedGroups) {
        treeState.groupStates.add(
          new GroupState(
            analyzedGroup.id,
            analyzedGroup.path,
            analyzedGroup.tokenType,
            analyzedGroup.description,
            analyzedGroup.extensions,
            treeState,
          ),
        );
      }

      return treeState;
    },
    onLeft: (errors) => {
      treeState.validationErrors.add(...errors);
      return treeState;
    },
  });
}
