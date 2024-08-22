import { parseJSONTokenTree } from '../parser/parseJSONTokenTree.js';
import { TokenState } from './TokenState.js';
import { TreeState } from './TreeState.js';
import { GroupState } from './GroupState.js';
import { findAnalyzedToken } from '../parser/internals/findAnalyzedToken.js';
import { recursivelyResolveAnalyzedToken } from '../parser/token/recursivelyResolveAnalyzedToken.js';
import { Reference } from './Reference.js';
import { ValidationError } from '../utils/validationError.js';
import { Option, Result } from '@swan-io/boxed';

import { matchTokenTypeAgainstAliasingMapping } from '../definitions/matchTokenTypeAgainstAliasingMapping.js';

export function buildTokenTree(value: unknown) {
  const treeState = new TreeState();

  parseJSONTokenTree(value).match({
    Ok: ({ tokens, groups }) => {
      const [analyzedTokens, tokenErrors] = tokens;
      const [analyzedGroups, groupErrors] = groups;

      if (tokenErrors.length > 0 || groupErrors.length > 0) {
        treeState.validationErrors.register(...tokenErrors);
      }

      // Post check the token references type against their type mapping
      const [validTokens, tokenTypeReferenceErrors] = analyzedTokens.reduce<
        [
          Array<{
            tokenState: TokenState;
            references: Array<Reference>;
          }>,
          Array<ValidationError>,
        ]
      >(
        (acc, analyzedToken) => {
          /* ------------------------------------------
             References check
          --------------------------------------------- */
          analyzedToken.value.toReferences
            .reduce<Result<Array<Reference>, Array<ValidationError>>>(
              (refsResult, analyzedReference) =>
                findAnalyzedToken(
                  analyzedTokens,
                  analyzedReference.toTreePath,
                ).match({
                  Some: (foundAnalyzedToken) => {
                    const resolutionTraces = recursivelyResolveAnalyzedToken(
                      analyzedTokens,
                      foundAnalyzedToken,
                      analyzedReference.fromTreePath,
                      analyzedReference.fromValuePath,
                    );

                    return resolutionTraces
                      .reduce<Option<string>>((previous, trace, index) => {
                        if (previous.isSome()) {
                          // abort early
                          return previous;
                        }
                        if (index === 0 && trace.status === 'resolved') {
                          // perform type check only on the first trace
                          return matchTokenTypeAgainstAliasingMapping(
                            analyzedToken.type,
                            trace.targetType,
                            trace.fromTreePath,
                            trace.fromValuePath,
                          ).match({
                            Ok: (_) => previous,
                            Error: (err) =>
                              Option.Some(
                                `expected [ ${err.expectedType} ] - got Token(${trace.targetType})`,
                              ),
                          });
                        }
                        return previous;
                      }, Option.None())
                      .match({
                        Some: (errMessage) => {
                          return refsResult.flatMap((_) =>
                            Result.Error([
                              new ValidationError({
                                type: 'Type',
                                treePath: analyzedReference.fromTreePath,
                                valuePath: analyzedReference.fromValuePath,
                                message: `Type mismatch: ${errMessage}`,
                                nodeKey: '$value',
                                referenceToTreePath:
                                  analyzedReference.toTreePath,
                              }),
                            ]),
                          );
                        },
                        None: () => {
                          const reference = new Reference(
                            analyzedToken.path,
                            analyzedReference.fromValuePath,
                            analyzedReference.toTreePath,
                            resolutionTraces,
                          );
                          return refsResult.map((refs) => [...refs, reference]);
                        },
                      });
                  },
                  None: () => {
                    const reference = new Reference(
                      analyzedToken.path,
                      analyzedReference.fromValuePath,
                      analyzedReference.toTreePath,
                      [
                        {
                          status: 'unresolvable',
                          fromTreePath: analyzedReference.fromValuePath,
                          fromValuePath: analyzedReference.fromValuePath,
                          toTreePath: analyzedReference.toTreePath,
                        },
                      ],
                    );
                    return refsResult.map((refs) => [...refs, reference]);
                  },
                }),
              Result.Ok([]),
            )
            .match({
              Ok: (references) => {
                const tokenState = new TokenState(
                  analyzedToken.path,
                  analyzedToken.type,
                  analyzedToken.description,
                  analyzedToken.extensions,
                  treeState,
                );
                tokenState.registerAnalyzedValue(analyzedToken.value);

                acc[0].push({ tokenState, references });
              },
              Error: (errors) => {
                acc[1].push(...errors);
              },
            });

          return acc;
        },
        [[], []],
      );

      if (tokenTypeReferenceErrors.length > 0) {
        treeState.validationErrors.register(...tokenTypeReferenceErrors);
      }
      for (const { tokenState, references } of validTokens) {
        for (const reference of references) {
          treeState.references.register(reference);
        }
        treeState.tokenStates.register(tokenState);
      }

      for (const analyzedGroup of analyzedGroups) {
        const groupState = new GroupState(
          analyzedGroup.path,
          analyzedGroup.tokenType,
          analyzedGroup.description,
          analyzedGroup.extensions,
        );

        treeState.groupStates.register(groupState);
      }
    },
    Error: (errors) => {
      treeState.validationErrors.register(...errors);
    },
  });

  return treeState;
}
