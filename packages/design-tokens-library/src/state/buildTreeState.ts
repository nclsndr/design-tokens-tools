import { Either, Option } from 'effect';
import { parseJSONTokenTree, parser } from '@nclsndr/w3c-design-tokens-parser';
import { TokenState } from './TokenState.js';
import { TreeState } from './TreeState.js';
import { GroupState } from './GroupState.js';
import { Reference } from './Reference.js';

export function buildTreeState(value: unknown) {
  const treeState = new TreeState();
  return Either.match(parseJSONTokenTree(value), {
    onRight: ({ analyzedTokens, analyzedGroups, tokenErrors, groupErrors }) => {
      if (tokenErrors.length > 0) {
        treeState.validationErrors.add(...tokenErrors);
      }
      if (groupErrors.length > 0) {
        treeState.validationErrors.add(...groupErrors);
      }

      for (const analyzedToken of analyzedTokens) {
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
          parser
            .findAnalyzedTokenByPath(analyzedTokens, analyzedRef.toTreePath)
            .pipe(
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